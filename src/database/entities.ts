
import { User } from "src/users/entity/user.entity";
import { Department } from "src/department/entities/department.entity";
import { Role } from "src/role/entities/role.entity";
import { Contract } from "src/contract/entities/contract.entity";
import { Attendance } from "src/attendance/entities/attendance.entity";
import { AttendanceLog } from "src/attendance/entities/attendanceLog.entity";
import { AttendanceSetting } from "src/attendance/entities/attendanceSetting.entity";


export const entities = [
  User,
  Department,
  Role,
  Contract,
  Attendance,
  AttendanceLog,
  AttendanceSetting,
]