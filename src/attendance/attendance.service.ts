import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { KafkaProducerService } from 'src/kafka/KafkaProducerService';
import { AttendanceSetting } from './entities/attendanceSetting.entity';
import { Attendance, AttendanceStatus, AttendanceType } from './entities/attendance.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRequest } from 'src/auth/auth.guard';
import { WeeklySummaryDto } from './dto/WeeklySummaryDto';
import { AttendanceQueryDto } from './dto/AttendanceQueryDto';
import { UpdateAttendanceDto } from './dto/UpdateAttendanceDto';
import { AttendanceStatisticsDto } from './dto/AttendanceStatisticsDto';
import { UsersService } from 'src/users/users.service';
import { CreateAttendanceSettingDto } from './dto/CreateAttendanceSettingDto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(AttendanceSetting)
    private readonly settingRepository: Repository<AttendanceSetting>,

    private readonly userService: UsersService,

    private readonly kafkaProducer: KafkaProducerService,
  ) { }
  async checkIn(
    userId: string,
    dto: CheckInDto,
    req: AuthRequest
  ) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const existed = await this.attendanceRepository.findOne({
      where: {
        user_id: userId,
        work_date: today,
      },
    });

    if (existed) {
      throw new BadRequestException('Bạn đã check-in hôm nay.');
    }

    const setting = await this.settingRepository.findOne({
      where: {},
    });

    if (!setting) {
      throw new BadRequestException('Chưa cấu hình giờ làm.');
    }

    const now = new Date();

    const [hour, minute] = setting.start_time.split(':').map(Number);

    const startTime = new Date();

    startTime.setHours(hour);
    startTime.setMinutes(minute);
    startTime.setSeconds(0);

    const lateMinutes = Math.floor(
      (now.getTime() - startTime.getTime()) / 60000,
    );

    const status =
      lateMinutes > setting.late_after
        ? AttendanceStatus.LATE
        : AttendanceStatus.PRESENT;

    const attendance = this.attendanceRepository.create({
      user_id: userId,
      work_date: today,
      check_in: now,
      note: dto.note,
      status,
      type: AttendanceType.OFFICE,
    });

    await this.attendanceRepository.save(attendance);

    await this.kafkaProducer.emit(
      'attendance.checkin',
      {
        attendanceId: attendance.id,
        userId,
        action: 'CHECK_IN',
        actionTime: now,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );

    return {
      message: 'Check-in thành công.',
      data: attendance,
    };
  }

  async checkOut(req: AuthRequest) {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.attendanceRepository.findOne({
      where: {
        user_id: userId,
        work_date: today,
      },
    });

    if (!attendance) {
      throw new BadRequestException(
        'Bạn chưa check-in hôm nay.',
      );
    }

    if (attendance.check_out) {
      throw new BadRequestException(
        'Bạn đã check-out rồi.',
      );
    }

    const now = new Date();

    attendance.check_out = now;

    // Nếu entity có working_hours
    // attendance.working_hours =
    //   (now.getTime() - attendance.check_in.getTime()) /
    //   1000 /
    //   60 /
    //   60;

    await this.attendanceRepository.save(attendance);

    await this.kafkaProducer.emit(
      'attendance.checkout',
      {
        attendanceId: attendance.id,
        userId,
        action: 'CHECK_OUT',
        actionTime: now,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    );

    return {
      message: 'Check-out thành công.',
      data: attendance,
    };
  }

  async getTodayAttendance(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [attendance, setting] = await Promise.all([
      this.attendanceRepository.findOne({
        where: {
          user_id: userId,
          work_date: today,
        },
      }),
      this.settingRepository
        .createQueryBuilder('setting')
        .getOne(),
    ]);

    return {
      checkedIn: !!attendance,
      checkedOut: !!attendance?.check_out,
      checkIn: attendance?.check_in ?? null,
      checkOut: attendance?.check_out ?? null,
      status: attendance?.status ?? null,
      workTime: {
        start: setting?.start_time,
        end: setting?.end_time,
      },
    };
  }


  async getTodayList(
    page = 1,
    limit = 10,
    keyword?: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .where('attendance.work_date = :today', { today });

    if (keyword?.trim()) {
      query.andWhere(
        `(
        user.name LIKE :keyword
        OR user.employee_code LIKE :keyword
        OR user.email LIKE :keyword
      )`,
        {
          keyword: `%${keyword.trim()}%`,
        },
      );
    }

    query
      .orderBy('attendance.check_in', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWeeklySummary(dto: WeeklySummaryDto) {
    const year = dto.year ?? new Date().getFullYear();
    const week = dto.week ?? this.getCurrentWeek();

    const startOfWeek = this.getStartOfISOWeek(year, week);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const rows = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('DATE(attendance.work_date)', 'date')
      .addSelect('attendance.status', 'status')
      .addSelect('COUNT(*)', 'total')
      .where('attendance.work_date BETWEEN :start AND :end', {
        start: startOfWeek,
        end: endOfWeek,
      })
      .groupBy('DATE(attendance.work_date)')
      .addGroupBy('attendance.status')
      .getRawMany();

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const result = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + index);

      return {
        date: date.toISOString().slice(0, 10),
        day: days[index],
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
      };
    });

    for (const row of rows) {
      const item = result.find((x) => x.date === row.date);

      if (!item) continue;

      switch (row.status) {
        case AttendanceStatus.PRESENT:
          item.present = Number(row.total);
          break;

        case AttendanceStatus.LATE:
          item.late = Number(row.total);
          break;

        case AttendanceStatus.ABSENT:
          item.absent = Number(row.total);
          break;

        case AttendanceStatus.LEAVE:
          item.leave = Number(row.total);
          break;
      }
    }

    return {
      week,
      year,
      startDate: startOfWeek,
      endDate: endOfWeek,
      data: result,
    };
  }

  async getDashboard(userId: string) {
    const [
      todayAttendance,
      todayList,
      weeklySummary,
      statistics,
    ] = await Promise.all([
      this.getTodayAttendance(userId),
      this.getTodayList(1, 10),
      this.getWeeklySummary({}),
      this.getStatistics(),
    ]);

    return {
      myAttendance: todayAttendance,
      weeklySummary,
      statistics,
      todayList,
    };
  }

  async findAll(dto: AttendanceQueryDto) {
    const query = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user');

    if (dto.keyword?.trim()) {
      query.andWhere(
        `
      (
        user.name LIKE :keyword
        OR user.employee_code LIKE :keyword
        OR user.email LIKE :keyword
      )
      `,
        {
          keyword: `%${dto.keyword.trim()}%`,
        },
      );
    }

    if (dto.work_date) {
      query.andWhere(
        'DATE(attendance.work_date) = :workDate',
        {
          workDate: dto.work_date,
        },
      );
    }

    if (dto.status) {
      query.andWhere(
        'attendance.status = :status',
        {
          status: dto.status,
        },
      );
    }

    query
      .orderBy('attendance.work_date', 'DESC')
      .addOrderBy('attendance.check_in', 'ASC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit);

    const [items, total] =
      await query.getManyAndCount();

    return {
      items,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
  }

  async findOne(id: string) {
    const attendance = await this.attendanceRepository
      .createQueryBuilder('attendance')

      .leftJoin('attendance.user', 'user')
      .leftJoin('attendance.logs', 'logs')

      .select([
        'attendance.id',
        'attendance.work_date',
        'attendance.check_in',
        'attendance.check_out',
        'attendance.status',
        'attendance.type',
        'attendance.note',

        'user.id',
        'user.name',
        'user.employee_code',
        'user.email',
        'user.avatar',

        'logs.id',
        'logs.action',
        'logs.action_time',
        'logs.ip_address',
        'logs.device',
      ])

      .where('attendance.id = :id', { id })

      .orderBy('logs.action_time', 'ASC')

      .getOne();

    if (!attendance) {
      throw new NotFoundException(
        'Không tìm thấy bản ghi chấm công.',
      );
    }

    return attendance;
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto,
    updatedBy: string,
  ) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Không tìm thấy bản ghi chấm công.');
    }

    if (dto.check_in) {
      attendance.check_in = new Date(dto.check_in);
    }

    if (dto.check_out) {
      attendance.check_out = new Date(dto.check_out);
    }

    if (dto.status) {
      attendance.status = dto.status;
    }

    if (dto.type) {
      attendance.type = dto.type;
    }

    if (dto.note !== undefined) {
      attendance.note = dto.note;
    }

    await this.attendanceRepository.save(attendance);

    await this.kafkaProducer.emit('attendance.updated', {
      attendanceId: attendance.id,
      updatedBy,
      action: 'UPDATE',
      actionTime: new Date(),
    });

    return {
      message: 'Cập nhật chấm công thành công.',
      data: attendance,
    };
  }

  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'total')
      .where('attendance.work_date = :today', { today })
      .groupBy('attendance.status')
      .getRawMany();

    const result = {
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
    };

    for (const row of rows) {
      switch (row.status) {
        case AttendanceStatus.PRESENT:
          result.present = Number(row.total);
          break;

        case AttendanceStatus.LATE:
          result.late = Number(row.total);
          break;

        case AttendanceStatus.ABSENT:
          result.absent = Number(row.total);
          break;

        case AttendanceStatus.LEAVE:
          result.leave = Number(row.total);
          break;
      }
    }

    return result;
  }

  async getStatisticsDx(dto?: AttendanceStatisticsDto) {
    let startDate: Date;
    let endDate: Date;

    if (dto?.start_date && dto?.end_date) {
      startDate = new Date(dto.start_date);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(dto.end_date);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const result = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select([
        `COUNT(*) AS total`,
        `SUM(CASE WHEN attendance.status = 'PRESENT' THEN 1 ELSE 0 END) AS present`,
        `SUM(CASE WHEN attendance.status = 'LATE' THEN 1 ELSE 0 END) AS late`,
        `SUM(CASE WHEN attendance.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent`,
        `SUM(CASE WHEN attendance.status = 'LEAVE' THEN 1 ELSE 0 END) AS leaveCount`,
        `SUM(CASE WHEN attendance.check_out IS NOT NULL THEN 1 ELSE 0 END) AS checkedOut`,
      ])
      .where('attendance.work_date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getRawOne();

    return {
      startDate,
      endDate,
      total: Number(result.total),
      present: Number(result.present),
      late: Number(result.late),
      absent: Number(result.absent),
      leave: Number(result.leaveCount),
      checkedOut: Number(result.checkedOut),
    };
  }

  async create(
    dto: CreateAttendanceDto,
    createdBy: string,
  ) {
    const workDate = new Date(dto.work_date);
    workDate.setHours(0, 0, 0, 0);

    const existed = await this.attendanceRepository.findOne({
      where: {
        user_id: dto.user_id,
        work_date: workDate,
      },
    });

    if (existed) {
      throw new BadRequestException(
        'Nhân viên đã có bản ghi chấm công trong ngày này.',
      );
    }

    const user = await this.userService.getById(dto.user_id);

    if (!user) {
      throw new NotFoundException('Không tìm thấy nhân viên.');
    }

    if (
      dto.check_in &&
      dto.check_out &&
      new Date(dto.check_out) <= new Date(dto.check_in)
    ) {
      throw new BadRequestException(
        'Giờ check-out phải lớn hơn giờ check-in.',
      );
    }

    const attendance = this.attendanceRepository.create({
      user_id: dto.user_id,
      work_date: workDate,
      check_in: dto.check_in,
      check_out: dto.check_out,
      status: dto.status,
      type: dto.type ?? AttendanceType.OFFICE,
      note: dto.note,
    });

    await this.attendanceRepository.save(attendance);

    await this.kafkaProducer.emit('attendance.created', {
      attendanceId: attendance.id,
      userId: dto.user_id,
      createdBy,
      action: 'CREATE',
      actionTime: new Date(),
    });

    return {
      message: 'Thêm chấm công thành công.',
      data: attendance,
    };
  }

  async createSetting(
  dto: CreateAttendanceSettingDto,
) {
  const existed = await this.settingRepository.findOne({
    where: {},
  });

  if (existed) {
    throw new BadRequestException(
      'Cấu hình giờ làm đã tồn tại.',
    );
  }

  const setting = this.settingRepository.create(dto);

  await this.settingRepository.save(setting);

  return {
    message: 'Tạo cấu hình giờ làm thành công.',
    data: setting,
  };
}

  private getCurrentWeek(): number {
    const date = new Date();

    const target = new Date(date.valueOf());

    const dayNr = (date.getDay() + 6) % 7;

    target.setDate(target.getDate() - dayNr + 3);

    const firstThursday = new Date(target.getFullYear(), 0, 4);

    const diff =
      target.getTime() - firstThursday.getTime();

    return (
      1 +
      Math.round(diff / (7 * 24 * 60 * 60 * 1000))
    );
  }

  private getStartOfISOWeek(
    year: number,
    week: number,
  ): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);

    const day = simple.getDay();

    if (day <= 4 && day !== 0) {
      simple.setDate(simple.getDate() - day + 1);
    } else {
      simple.setDate(
        simple.getDate() + (8 - (day || 7)),
      );
    }

    simple.setHours(0, 0, 0, 0);

    return simple;
  }

}


