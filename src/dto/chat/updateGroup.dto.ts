import { ApiProperty } from '@nestjs/swagger';

export default class UpdateGroupDto {
  @ApiProperty()
  groupId: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  description?: string;
}
