import { ApiProperty } from '@nestjs/swagger';

export default class LoginDto {
  @ApiProperty({
    type: 'string',
  })
  email: string;

  @ApiProperty({
    type: 'string',
  })
  password: string;
}
