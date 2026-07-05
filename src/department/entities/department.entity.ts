import { User } from 'src/users/entity/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';


@Entity('departments')
@Index('idx_departments_id', ['id'])
@Index('idx_departments_code', ['code'], { unique: true })
export class Department {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Mã phòng ban (VD: IT, HR, MKT...)
    @Column({
        type: 'varchar',
        length: 20,
        unique: true,
    })
    code!: string;

    // Tên phòng ban
    @Column({
        type: 'varchar',
        length: 100,
    })
    name!: string;

    // Mô tả
    @Column({
        type: 'text',
        nullable: true,
    })
    description!: string | null;

    // Trưởng phòng
    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'manager_id' })
    manager!: User | null;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    manager_id!: string | null;

    // Danh sách nhân viên
    @OneToMany(() => User, (user: User) => user.department)
    employees!: User[];

    // Trạng thái
    @Column({
        type: 'boolean',
        default: true,
    })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date | null;
}