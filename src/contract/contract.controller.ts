import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { SendResponse } from 'src/response.utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() dto: CreateContractDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {

    console.log('BODY:', dto);
    console.log('FILE:', file);

    const contract = await this.contractService.create(dto, file);

    return SendResponse({
      message: 'Tạo hợp đồng thành công',
      data: contract,
    });
  }

  @Get()
  async findAll() {
    const contracts = await this.contractService.findAll();
    return SendResponse({
      message: 'Lấy danh sách hợp đồng thành công',
      data: contracts,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contract = await this.contractService.findOne(id);
    return SendResponse({
      message: 'Lấy thông tin hợp đồng thành công',
      data: contract,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    const contract = await this.contractService.update(id, updateContractDto);
    return SendResponse({
      message: 'Cập nhật hợp đồng thành công',
      data: contract,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.contractService.remove(id);
    return SendResponse({
      message: 'Xóa hợp đồng thành công',
    });
  }
}
