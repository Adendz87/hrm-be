import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/redis/redis.service';

interface UserCache {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  employee_code: string;
  gender: string | null;
  birthday: Date | null;
  phone: string | null;
  address: string | null;
  hire_date: Date | null;
  status: string;
  position: string;
  role: any;

  department?: {
    id: string;
    name: string;
  }
}

export interface AuthRequest extends Request {
  user: UserCache;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) { }


  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (isPublic) return true;

    const request =
      context.switchToHttp().getRequest<AuthRequest>();

    const token =
      this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException(
        "Missing token"
      );
    }

    let payload: any;

    try {

      payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET,
        }
      );

    } catch {

      throw new UnauthorizedException(
        "Invalid or expired token"
      );

    }



    const cacheKey = `user:${payload.sub}`;

    let user = await this.redisService.get<UserCache>(cacheKey);

    if (!user) {

      console.log("CACHE MISS");

      const dbUser = await this.usersService.findEmail(
        payload.email
      );

      if (!dbUser) {
        throw new UnauthorizedException(
          "User not found"
        );
      }


      user = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        employee_code: dbUser.employee_code,
        gender: dbUser.gender,
        birthday: dbUser.birthday,
        phone: dbUser.phone,
        address: dbUser.address,
        hire_date: dbUser.hire_date,
        status: dbUser.status,
        position: dbUser.position,
        role: dbUser.role
      };


      await this.redisService.set(
        cacheKey,
        user,
        3600
      );


      console.log("CACHE SAVED:", cacheKey);

    } else {

      console.log("CACHE HIT:", cacheKey);

    }


    request.user = user;

    return true;
  }



  private extractTokenFromCookie(
    request: Request
  ): string | undefined {

    return request.cookies?.access_token;

  }

}