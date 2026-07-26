import { User } from "src/users/entity/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum ContractType {
    INTERN = 'INTERN',
    PROBATION = 'PROBATION',
    OFFICIAL = 'OFFICIAL',
    FIXED_TERM = 'FIXED_TERM',
    INDEFINITE = 'INDEFINITE',
}
export enum ContractStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    EXPIRING = 'EXPIRING',
    EXPIRED = 'EXPIRED',
    TERMINATED = 'TERMINATED',
}
@Entity('contracts')
export class Contract {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'employee_id' })
    employee!: User;

    @Column('uuid')
    employee_id!: string;

    @Column({
        length: 50,
        unique: true,
    })
    contract_number!: string;

    @Column({
        length: 100,
    })
    contract_name!: string;

    @Column({
        type: 'enum',
        enum: ContractType,
    })
    type!: ContractType;

    @Column({
        type: 'enum',
        enum: ContractStatus,
    })
    status!: ContractStatus;

    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: true,
    })
    salary!: number | null;

    @Column({
        type: 'date',
    })
    start_date!: Date;

    @Column({
        type: 'date',
    })
    end_date!: Date;

    @Column({
        type: 'date',
        nullable: true,
    })
    signed_date!: Date | null;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: true,
    })
    file_url!: string | null;

    @Column({
        default: 1,
    })
    version!: number;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    previous_contract_id!: string | null;

    @Column({
        type: 'text',
        nullable: true,
    })
    note!: string | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @DeleteDateColumn()
    deleted_at!: Date | null;
}