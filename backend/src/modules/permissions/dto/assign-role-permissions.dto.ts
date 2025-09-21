import { IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolePermissionsDto {
  @ApiProperty({ 
    description: '权限ID列表', 
    example: [1, 2, 3],
    type: [Number]
  })
  @IsArray()
  @IsInt({ each: true })
  permissionIds: number[];
}