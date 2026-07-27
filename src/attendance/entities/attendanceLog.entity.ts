import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Attendance } from "./attendance.entity";

@Entity("attendance_logs")
export class AttendanceLog {

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  attendance_id!: string;

  @Column()
  action!: string; //CHECK_IN CHECK_OUT

  @Column()
  action_time!: Date;

  @Column({ nullable: true })
  ip_address!: string;

  @Column({ nullable: true })
  device!: string;

  @ManyToOne(
  () => Attendance,
  (attendance) => attendance.logs,
)
@JoinColumn({ name: 'attendance_id' })
attendance!: Attendance;
}