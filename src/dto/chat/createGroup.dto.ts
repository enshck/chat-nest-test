import { ApiProperty } from '@nestjs/swagger';

export default class CreateGroupDto {
  @ApiProperty({
    type: 'string',
  })
  name: string;

  @ApiProperty({
    type: 'string',
  })
  description: string;
}
