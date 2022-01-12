import { ApiProperty } from '@nestjs/swagger';

export default class UpdateUser {
  @ApiProperty({
    type: 'string',
  })
  email?: string;

  @ApiProperty({
    type: 'string',
  })
  userName?: string;
}
