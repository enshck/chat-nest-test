import { ApiProperty } from '@nestjs/swagger';

export default class UpdateMessage {
  @ApiProperty()
  content: string;

  @ApiProperty()
  messageId: string;
}
