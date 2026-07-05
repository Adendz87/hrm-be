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
    async signIn(@Body() signInDto: Record<string, any>) {
        const token = await this.authService.signIn(
            signInDto.email,
            signInDto.password,
        );
        console.log(token)
        if (!token) {
            return SendResponse({
                message: 'Sai thông tin email hoặc mật khẩu',
                code: HttpStatus.BAD_REQUEST,
            });
        }
        const user = await this.userService.getUsersByEmail(signInDto.email);
        return SendResponse({
            message: 'Đăng nhập thành công.',
            data: {
                access_token: token.access_token,
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
}