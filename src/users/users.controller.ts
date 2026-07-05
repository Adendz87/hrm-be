import { Controller, Get, UseGuards, Request, Query, Param, Patch, Body, HttpStatus, Req, Post, Delete, UseInterceptors, UploadedFile, BadRequestException, Put } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiTags } from "@nestjs/swagger";
import { ApiResponse } from "src/commons/api-response";
import { AuthGuard } from "src/auth/auth.guard";


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @UseGuards(AuthGuard)
  @Get('profile')
  async profile(@Request() req) {
    const result = await this.usersService.profile(req.user);
    return ApiResponse.success("success", result);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getAll() {
    return await this.usersService.allUser();
  }
  @UseGuards(AuthGuard)
  @Get('detail')
  async getDetail(@Query('id') id: string) {
    return await this.usersService.getById(id);
  }
}