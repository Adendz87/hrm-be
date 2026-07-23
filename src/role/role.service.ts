import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly redisService: RedisService,
  ) { }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existed = await this.roleRepository.findOne({
      where: {
        code: dto.code,
      },
    });

    if (existed) {
      throw new ConflictException('Role code already exists');
    }

    const role = this.roleRepository.create(dto);

    const result = await this.roleRepository.save(role);

    // Chỉ cần xóa cache list
    await this.redisService.del('roles:all');

    return result;
  }

  async findAll(): Promise<Role[]> {
    const cache = await this.redisService.get<Role[]>('roles:all');

    if (cache) {
      return cache;
    }

    const roles = await this.roleRepository.find({
      order: {
        created_at: 'DESC',
      },
    });

    await this.redisService.set('roles:all', roles, 3600);

    return roles;
  }

  async findOne(id: string): Promise<Role | null> {
    const cache = await this.redisService.get<Role>(`role:${id}`);

    if (cache) {
      return cache;
    }

    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      return null;
    }

    await this.redisService.set(`role:${id}`, role, 3600);

    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    return this.roleRepository.manager.transaction(async (manager) => {
      const role = await manager.findOne(Role, {
        where: { id },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      if (dto.code && dto.code !== role.code) {
        const existed = await manager.findOne(Role, {
          where: {
            code: dto.code,
          },
        });

        if (existed) {
          throw new ConflictException('Role code already exists');
        }
      }

      await manager.update(Role, { id }, dto);

      const updatedRole = await manager.findOne(Role, {
        where: { id },
      });

      return updatedRole!;
    }).then(async (updatedRole) => {
      // Sau khi transaction commit thành công
      await Promise.all([
        this.redisService.del('roles:all'),
        this.redisService.del(`role:${id}`),
      ]);

      return updatedRole;
    });
  }

  async remove(id: string): Promise<void> {
    await this.roleRepository.manager.transaction(async (manager) => {
      const role = await manager.findOne(Role, {
        where: { id },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      await manager.softDelete(Role, { id });
    });

    await Promise.all([
      this.redisService.del('roles:all'),
      this.redisService.del(`role:${id}`),
    ]);
  }
}
