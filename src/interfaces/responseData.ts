import { ApiProperty } from '@nestjs/swagger';

interface IResponseData<T> {
  data: T;
}

export class PaginationData {
  @ApiProperty()
  nextCursor: string | null;
}

export default IResponseData;
