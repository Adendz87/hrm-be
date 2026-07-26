import { Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from 'src/auth/dto/register.dto';
import { RedisService } from 'src/redis/redis.service';
import { Role } from 'src/role/entities/role.entity';
import { RoleService } from 'src/role/role.service';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
    private roleService: RoleService,

  ) { }

  async getUsersByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    console.log(user)
    return user;
  }

  async findEmail(email: string) {

    return this.userRepository.findOne({
      where: {
        email
      },
      relations: {
        department: true
      }
    });

  }

  async profile(req: User) {
    const user = await this.userRepository.findOneBy({ id: req.id });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const { password, ...userWithoutPassword } = user;
    return { userWithoutPassword };
  }

  async createUser(user: CreateUserDto): Promise<User> {
    const role = await this.roleService.findOne(user.role_id);
    if (!role) {
      throw new NotFoundException('Role không tồn tại');
    }

    const entity = this.userRepository.create({
      ...user,
      role,
    });

    return await this.userRepository.save(entity);
  }
  async allUser(
    page = 1,
    limit = 20,
  ) {

    const cacheKey =
      `users:list:page:${page}:limit:${limit}`;


    const cachedUsers =
      await this.redisService.get<User[]>(cacheKey);


    if (cachedUsers) {
      console.log(
        "LIST USER CACHE HIT"
      );

      return cachedUsers;
    }


    console.log(
      "LIST USER CACHE MISS"
    );


    const [users, total] =
      await this.userRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,

        relations: {
          department: true,
        },

        order: {
          created_at: "DESC",
        },
      });


    const result = {
      data: users.map(user => {

        const {
          password,
          ...userWithoutPassword
        } = user;

        return userWithoutPassword;
      }),

      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
      },
    };


    await this.redisService.set(
      cacheKey,
      result,
      30, // list cache ngắn
    );


    return result;
  }


  async getById(id: string) {

    const cacheKey = `user:${id}`;

    const cachedUser =
      await this.redisService.get<User>(cacheKey);


    if (cachedUser) {
      return {
        userWithoutPassword: cachedUser,
      };
    }


    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        department: true,
      },
    });


    if (!user) {
      throw new NotFoundException(
        'Người dùng không tồn tại'
      );
    }


    const { password, ...userWithoutPassword } = user;


    await this.redisService.set(
      cacheKey,
      userWithoutPassword,
      3600,
    );


    return {
      userWithoutPassword,
    };
  }

  async updateUser(
    id: string,
    payload: Partial<User>,
  ) {

    const user =
      await this.userRepository.findOne({
        where: {
          id,
        },
      });


    if (!user) {
      throw new NotFoundException(
        "Người dùng không tồn tại"
      );
    }



    await this.userRepository.update(
      id,
      payload,
    );



    const updatedUser =
      await this.userRepository.findOne({
        where: {
          id,
        },

        relations: {
          department: true,
        },
      });



    if (!updatedUser) {
      throw new NotFoundException(
        "Người dùng không tồn tại"
      );
    }



    const {
      password,
      ...userWithoutPassword
    } = updatedUser;



    await this.redisService.set(
      `user:${id}`,
      userWithoutPassword,
      3600,
    );



    await this.redisService.clearByPattern(
      "users:list:*"
    );



    return {
      userWithoutPassword,
    };
  }


}
