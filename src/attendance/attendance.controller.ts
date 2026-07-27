import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { AuthGuard, AuthRequest } from 'src/auth/auth.guard';
import { AttendanceQueryDto } from './dto/AttendanceQueryDto';
import { WeeklySummaryDto } from './dto/WeeklySummaryDto';
import { AttendanceStatisticsDto } from './dto/AttendanceStatisticsDto';
import { CreateAttendanceSettingDto } from './dto/CreateAttendanceSettingDto';



@UseGuards(AuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('check-in')
  async checkIn(
    @Req() req: AuthRequest,
    @Body() dto: CheckInDto,
  ) {
    return this.attendanceService.checkIn(req.user.id, dto, req);
  }

  @Post('check-out')
  checkOut(@Req() req: AuthRequest) {
    return this.attendanceService.checkOut(req);
  }

  @Get('today')
  async getTodayAttendance(
    @Req() req: AuthRequest,
  ) {
    return this.attendanceService.getTodayAttendance(req.user.id);
  }

  @Get('today-list')
  async getTodayList(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
  ) {
    return this.attendanceService.getTodayList(+page, +limit, keyword);
  }

  @Get('weekly-summary')
  getWeeklySummary(
    @Query() dto: WeeklySummaryDto,
  ) {
    return this.attendanceService.getWeeklySummary(dto);
  }

  @Get('dashboard')
  getDashboard(
    @Req() req: AuthRequest,
  ) {
    return this.attendanceService.getDashboard(req.user.id);
  }

  @Get()
  findAll(
    @Query() dto: AttendanceQueryDto,
  ) {
    return this.attendanceService.findAll(dto);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceDto,
    @Req() req: AuthRequest,
  ) {
    return this.attendanceService.update(id, dto, req.user.id);
  }

  @Get('statistics')
  getStatistics(
    @Query() dto: AttendanceStatisticsDto,
  ) {
    return this.attendanceService.getStatisticsDx(dto);
  }

  @Post()
  create(
    @Body() dto: CreateAttendanceDto,
    @Req() req: AuthRequest,
  ) {
    return this.attendanceService.create(
      dto,
      req.user.id,
    );
  }

  @Post('setting')
createSetting(
  @Body() dto: CreateAttendanceSettingDto,
) {
  return this.attendanceService.createSetting(dto);
}
}
