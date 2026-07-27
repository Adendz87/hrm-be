import { User } from "src/users/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AttendanceLog } from "./attendanceLog.entity";


export enum AttendanceStatus {
    PRESENT = "PRESENT",
    LATE = "LATE",
    ABSENT = "ABSENT",
    LEAVE = "LEAVE",
}
export enum AttendanceType {
    OFFICE = "OFFICE",
    REMOTE = "REMOTE",
}
@Entity("attendances")
export class Attendance {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    user_id!: string;

    @ManyToOne(
        () => User,
        (user) => user.attendances,
    )
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: "date" })
    work_date!: Date;

    @Column({ type: "datetime", nullable: true })
    check_in!: Date;

    @Column({ type: "datetime", nullable: true })
    check_out!: Date;

    @Column({
        type: "enum",
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT,
    })
    status!: AttendanceStatus;

    @Column({
        type: "enum",
        enum: AttendanceType,
        default: AttendanceType.OFFICE,
    })
    type!: AttendanceType;

    @Column({ nullable: true })
    note!: string;

    @OneToMany(
        () => AttendanceLog,
        (log) => log.attendance,
    )
    logs!: AttendanceLog[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}