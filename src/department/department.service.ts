import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) { }

  async create(user: any, createDepartmentDto: CreateDepartmentDto) {
    // check department name exists 
    const department = await this.departmentRepository.findOneBy({ name: createDepartmentDto.name });
    if (department) {
      throw new BadRequestException('Department name already exists');
    }
    const newDepartment = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save({ ...newDepartment, manager_id: user.id });
  }

  async findAll() {
    return this.departmentRepository.find();
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findOneBy({ id });
    if (!department) {
      throw new BadRequestException('Department not found');
    }
    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findOneBy({ id });
    if (!department) {
      throw new BadRequestException('Department not found');
    }
    return this.departmentRepository.update(id, updateDepartmentDto);
  }

  async remove(id: string) {
    const department = await this.departmentRepository.findOneBy({ id });
    if (!department) {
      throw new BadRequestException('Department not found');
    }
    return this.departmentRepository.delete(id);
  }
}
