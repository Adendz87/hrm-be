import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/register.dto';


@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,

  ) { }
  async signIn(email: string, pass: string) {
    try {
      const user = await this.userService.getUsersByEmail(email);

      if (!user) return false;

      const passwordValid = await bcrypt.compare(pass, user.password);

      if (!passwordValid) return false;

      const payload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = await this.jwtService.signAsync(payload, {
        expiresIn: "15m",
      });

      const refresh_token = await this.jwtService.signAsync(payload, {
        expiresIn: "7d",
      });

      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      return false;
    }
  }
  async checkUser(email: string) {
    const check = await this.userService.findEmail(email);
    return check
  }

  public generateRandomPassword(length = 12): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const number = '0123456789';
    const special = '!@#$%^&*';

    const all = upper + lower + number + special;

    const pick = (str: string) =>
      str[Math.floor(Math.random() * str.length)];

    const password =
      pick(upper) +
      pick(lower) +
      pick(number) +
      pick(special) +
      Array.from({ length: length - 4 }, () => pick(all)).join('');

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  async registerUser(body: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(body.password, 10);

    return this.userService.createUser({
      ...body,
      password: hashedPassword,
    });
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
      };

      const access_token = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      const refresh_token = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      return {
        access_token,
        refresh_token,
      }

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
