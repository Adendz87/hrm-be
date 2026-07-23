import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Query,
    Patch,
    BadRequestException,
    Req,
    UseGuards,
    Res,
    Get,

} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { SendResponse } from 'src/response.utils';
import { ApiResponse } from 'src/commons/api-response';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { AuthGuard, AuthRequest } from './auth.guard';
import {
    ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/register.dto';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
    ) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(
        @Body() signInDto: Record<string, any>,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = await this.authService.signIn(
            signInDto.email,
            signInDto.password,
        );

        if (!token) {
            return SendResponse({
                message: 'Sai thông tin email hoặc mật khẩu',
                code: HttpStatus.BAD_REQUEST,
            });
        }

        // Set HttpOnly Cookie
        res.cookie('access_token', token.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refresh_token", token.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const user = await this.userService.getUsersByEmail(signInDto.email);

        return SendResponse({
            message: 'Đăng nhập thành công.',
            data: {
                user: user
                    ? {
                        email: user.email,
                        name: user.name,
                        employee_code: user.employee_code,
                        id: user.id,
                        avatar: user.avatar,
                        gender: user.gender,
                        birthday: user.birthday,
                        identity_number: user.identity_number,
                        phone: user.phone,
                        address: user.address,
                        hire_date: user.hire_date,
                        status: user.status,
                    }
                    : null,
            },
        });
    }

    @Post("logout")
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        return {
            message: "Logout success"
        };
    }

    @UseGuards(AuthGuard)
    @Get("me")
    async me(@Req() req: AuthRequest) {
        return SendResponse({
            message: "Success",
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    avatar: req.user.avatar,
                    employee_code: req.user.employee_code,
                    gender: req.user.gender,
                    birthday: req.user.birthday,
                    phone: req.user.phone,
                    address: req.user.address,
                    hire_date: req.user.hire_date,
                    status: req.user.status,
                },
            },
        });
    }

    @UseGuards(AuthGuard)
    @Post('register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
        const check = await this.userService.findEmail(createUserDto.email);
        if (check) {
            return SendResponse({
                message: 'Email đã tồn tại',
                code: HttpStatus.BAD_REQUEST,
            });
        }
        const user = await this.authService.registerUser(createUserDto);
        return SendResponse({
            message: 'Tạo tài khoản thành công.',
            data: {
                user: user
                    ? {
                        email: user.email,
                        name: user.name,
                        employee_code: user.employee_code,
                        id: user.id,
                        avatar: user.avatar,
                        gender: user.gender,
                        birthday: user.birthday,
                        identity_number: user.identity_number,
                        phone: user.phone,
                        address: user.address,
                        hire_date: user.hire_date,
                        status: user.status,
                    }
                    : null,
            },
        });
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(
        @Req() req: AuthRequest,
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.refresh_token;

        console.log(req.headers.cookie);
        console.log(req.cookies);

        if (!refreshToken) {
            return SendResponse({
                message: 'Refresh token không tồn tại.',
                code: HttpStatus.UNAUTHORIZED,
            });
        }

        const token = await this.authService.refresh(refreshToken);

        if (!token) {
            return SendResponse({
                message: 'Refresh token không hợp lệ.',
                code: HttpStatus.UNAUTHORIZED,
            });
        }

        res.cookie('access_token', token.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refresh_token', token.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return SendResponse({
            message: 'Làm mới token thành công.',
        });
    }
}