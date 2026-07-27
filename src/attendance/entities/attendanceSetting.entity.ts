import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("attendance_settings")
export class AttendanceSetting {

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  start_time!: string; //09:00

  @Column()
  end_time!: string; //18:00

  @Column()
  late_after!: number; // phút

  @Column()
  work_hours!: number;
}