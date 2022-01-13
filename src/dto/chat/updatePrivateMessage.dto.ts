import { ApiProperty } from '@nestjs/swagger';

export default class UpdatePrivateMessageDto {
  @ApiProperty({
    type: 'string',
  })
  content: string;

  @ApiProperty({
    type: 'string',
  })
  id: string;
}
