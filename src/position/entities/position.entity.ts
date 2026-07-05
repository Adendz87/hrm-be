import { User } from 'src/users/entity/user.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('positions')
@Index('idx_positions_id', ['id'])
@Index('idx_positions_code', ['code'], { unique: true })
export class Position {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Mã chức vụ
    @Column({
        type: 'varchar',
        length: 20,
        unique: true,
    })
    code!: string;

    // Tên chức vụ
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

    // Trạng thái
    @Column({
        type: 'boolean',
        default: true,
    })
    is_active!: boolean;

    // Danh sách nhân viên có chức vụ này
    @OneToMany(() => User, (user) => user.role)
    users!: User[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date | null;
}