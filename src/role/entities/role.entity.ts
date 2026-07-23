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

@Entity('roles')
@Index('idx_roles_id', ['id'])
@Index('idx_roles_code', ['code'], { unique: true })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Mã quyền
    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
    })
    code!: string;

    // Tên quyền
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

    // Danh sách user thuộc role này
    @OneToMany(() => User, (user) => user.role)
    users!: User[];

    @ManyToOne(() => Role, (role) => role.users, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Column({
        type: 'uuid',
    })
    role_id!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date | null;
}