import { Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from 'src/auth/dto/register.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async getUsersByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    console.log(user)
    return user;
  }

  async findEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async profile(req: User) {
    const user = await this.userRepository.findOneBy({ id: req.id });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const { password, ...userWithoutPassword } = user;
    return { userWithoutPassword };
  }

  async createUser(user: CreateUserDto) {
    return this.userRepository.save(user);
  }
  async allUser() {
    return this.userRepository.find();
  }

  async getById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        department: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const { password, ...userWithoutPassword } = user;
    return { userWithoutPassword };
  }

}
