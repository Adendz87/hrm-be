import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { UserRole } from 'src/users/entity/user.entity';

export const CACHE_KEYS = {
  DEPARTMENTS: 'departments:list',
  DEPARTMENT: (id: string) => `department:${id}`,
};

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    private readonly redisService: RedisService,
  ) { }

  async create(user: any, createDepartmentDto: CreateDepartmentDto) {
    const department = await this.departmentRepository.findOneBy({
      name: createDepartmentDto.name,
    });

    if (department) {
      throw new BadRequestException('Department name already exists');
    }

    const newDepartment = this.departmentRepository.create({
      ...createDepartmentDto,
      manager_id: user.id,
    });

    const saved = await this.departmentRepository.save(newDepartment);

    // Xóa cache list
    await this.redisService.del(CACHE_KEYS.DEPARTMENTS);

    return saved;
  }
  async findAll() {
    const cacheKey = CACHE_KEYS.DEPARTMENTS;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const departments = await this.departmentRepository
      .createQueryBuilder('department')
      // Join tất cả nhân viên để đếm
      .leftJoin('department.employees', 'employee')
      // Join Leader của phòng ban
      .leftJoin(
        'department.employees',
        'leader',
        'leader.role = :role',
        {
          role: UserRole.LEADER,
        },
      )
      .select([
        'department.id',
        'department.code',
        'department.name',
        'department.description',
        'department.is_active',
        'department.created_at',
      ])
      .addSelect('leader.name', 'leader_name')
      .addSelect('COUNT(DISTINCT employee.id)', 'headcount')
      .groupBy('department.id')
      .addGroupBy('leader.id')
      .addGroupBy('leader.name')
      .getRawMany();

    const result = departments.map((item) => ({
      id: item.department_id,
      code: item.department_code,
      name: item.department_name,
      description: item.department_description,
      is_active: item.department_is_active,
      created_at: item.department_created_at,

      headcount: Number(item.headcount),
      lead: item.leader_name ?? 'Chưa phân công',
    }));

    await this.redisService.set(cacheKey, result, 600);

    return result;
  }
  async findOne(id: string) {
    const cacheKey = CACHE_KEYS.DEPARTMENT(id);

    const cached = await this.redisService.get<Department>(cacheKey);

    if (cached) {
      return cached;
    }

    const department = await this.departmentRepository.findOneBy({ id });

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    await this.redisService.set(cacheKey, department, 300);

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findOneBy({ id });

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    await this.departmentRepository.update(id, updateDepartmentDto);

    // Xóa cache
    await Promise.all([
      this.redisService.del(CACHE_KEYS.DEPARTMENTS),
      this.redisService.del(CACHE_KEYS.DEPARTMENT(id)),
    ]);

    return this.findOne(id);
  }

  async remove(id: string) {
    const department = await this.departmentRepository.findOneBy({ id });

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    await this.departmentRepository.delete(id);

    // Xóa cache
    await Promise.all([
      this.redisService.del('departments:list'),
      this.redisService.del(`department:${id}`),
    ]);

    return {
      message: 'Delete department successfully',
    };
  }
}
