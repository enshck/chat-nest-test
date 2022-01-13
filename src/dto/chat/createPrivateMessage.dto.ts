import { ApiProperty } from '@nestjs/swagger';

export default class CreatePrivateMessageDto {
  @ApiProperty({
    type: 'string',
  })
  content: string;

  @ApiProperty({
    type: 'string',
  })
  userId: string;
}
