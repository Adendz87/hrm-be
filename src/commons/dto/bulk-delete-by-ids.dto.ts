import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

/** Body for bulk soft-delete endpoints (customers, tickets, …). */
export class BulkDeleteByIdsDto {
  @ApiProperty({
    description:
      'Danh sách UUID (v4) cần xóa mềm. Ít nhất một phần tử; trùng lặp sẽ được loại khi xử lý.',
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'ids must contain at least one id' })
  @IsUUID('4', { each: true })
  ids: string[];
}
