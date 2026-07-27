import { Exclude } from 'class-transformer';
import { Attendance } from 'src/attendance/entities/attendance.entity';
import { Contract } from 'src/contract/entities/contract.entity';
import { Department } from 'src/department/entities/department.entity';
import { Role } from 'src/role/entities/role.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RESIGNED = 'resigned',
}

export enum Position {
  EMPLOYEE = 'EMPLOYEE',
  LEADER = 'LEADER',
  MANAGER = 'MANAGER',
  DIRECTOR = 'DIRECTOR',
}

@Entity('users')
@Index('idx_users_id', ['id'])
@Index('idx_users_employee_code', ['employee_code'], { unique: true })
@Index('idx_users_email', ['email'], { unique: true })
@Index('idx_users_identity_number', ['identity_number'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Mã nhân viên
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  employee_code!: string;

  // Ảnh đại diện
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  avatar!: string | null;

  // Họ tên
  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  // Giới tính
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender!: Gender | null;

  // Ngày sinh
  @Column({
    type: 'date',
    nullable: true,
  })
  birthday!: Date | null;

  // CCCD
  @Column({
    type: 'varchar',
    length: 12,
    unique: true,
    nullable: true,
  })
  identity_number!: string | null;

  // Email
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email!: string;

  // SĐT
  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  phone!: string | null;

  // Địa chỉ
  @Column({
    type: 'text',
    nullable: true,
  })
  address!: string | null;

  // Ngày vào làm
  @Column({
    type: 'date',
    nullable: true,
  })
  hire_date!: Date | null;

  // Trạng thái
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 255,
  })
  password!: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updated_at!: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  deleted_at!: Date | null;

  @ManyToOne(() => Department, (department) => department.employees, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'department_id' })
  department!: Department | null;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  department_id!: string | null;

  @Column({
    type: 'enum',
    enum: Position,
    default: Position.EMPLOYEE
  })
  position!: Position;

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: true
  })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  role_id!: string;



  @OneToMany(() => Contract, contract => contract.employee)
  contracts!: Contract[];

  @OneToMany(
    () => Attendance,
    (attendance) => attendance.user,
  )
  attendances!: Attendance[];
}