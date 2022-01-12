import { ApiProperty } from '@nestjs/swagger';

export interface IResponseMessage {
  message: string;
}

export class ResponseMessage {
  @ApiProperty()
  message: string;
}
