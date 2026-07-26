import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { KafkaProducerService } from 'src/kafka/KafkaProducerService';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly usersService: UsersService,
    private readonly kafkaProducerService: KafkaProducerService,
    private readonly uploadService: UploadService,
  ) { }
  async create(
    dto: CreateContractDto,
    file?: Express.Multer.File,
  ) {
    console.log(dto.employee_id)
    const employee = await this.usersService.getById(dto.employee_id);

    if (!employee) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    const existedNumber = await this.contractRepository.findOne({
      where: {
        contract_number: dto.contract_number,
      },
    });

    if (existedNumber) {
      throw new ConflictException('Số hợp đồng đã tồn tại');
    }

    const activeContract = await this.contractRepository.findOne({
      where: {
        employee_id: dto.employee_id,
        status: ContractStatus.ACTIVE,
      },
    });

    if (activeContract) {
      throw new ConflictException(
        'Nhân viên đã có hợp đồng đang hiệu lực',
      );
    }

    if (dto.start_date > dto.end_date) {
      throw new BadRequestException(
        'Ngày bắt đầu phải nhỏ hơn ngày kết thúc',
      );
    }

    // lưu file tạm
    let tempPath: string | null = null;

    if (file) {
      tempPath = await this.uploadService.saveTemp(file);
    }

    const contract =
      await this.contractRepository.save(
        this.contractRepository.create({
          ...dto,
          status: ContractStatus.ACTIVE,
          file_url: null,
        }),
      );

    if (tempPath) {
      await this.kafkaProducerService.emit(
        'contract.upload',
        {
          contractId: contract.id,
          tempPath,
        },
      );
    }

    return contract;
  }
  async findAll() {
    return await this.contractRepository
      .createQueryBuilder('contract')
      .leftJoin('contract.employee', 'employee')
      .select([
        'contract.id',
        'contract.contract_number',
        'contract.contract_name',
        'contract.type',
        'contract.status',
        'contract.salary',
        'contract.start_date',
        'contract.end_date',
        'contract.signed_date',
        'contract.file_url',
        'contract.note',
        'contract.created_at',
        'employee.id',
        'employee.name',
        'employee.email',
      ])
      .orderBy('contract.created_at', 'DESC')
      .getMany();
  }

  async findOne(
    id: string,
  ) {

    const contract =
      await this.contractRepository.findOne({
        where: {
          id,
        },
        relations: {
          employee: true,
        },
      });
    if (!contract) {

      throw new NotFoundException(
        'Không tìm thấy hợp đồng',
      );

    }
    return contract;
  }

  async update(
    id: string,
    dto: UpdateContractDto,
  ) {


    const contract =
      await this.findOne(id);

    // không cho sửa mấy field nhạy cảm
    delete dto.employee_id;
    delete dto.file_url;

    Object.assign(
      contract,
      dto,
    );

    return await this.contractRepository.save(
      contract,
    );
  }

  async remove(
    id: string,
  ) {
    const contract =
      await this.findOne(id);
    await this.contractRepository.softRemove(
      contract,
    );

    return {

      message:
        'Xóa hợp đồng thành công',

    };
  }
}

