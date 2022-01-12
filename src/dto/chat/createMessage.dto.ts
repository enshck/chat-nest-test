import { ApiProperty } from '@nestjs/swagger';

export default class CreateMessage {
  @ApiProperty()
  content: string;

  @ApiProperty()
  groupId: string;
}
