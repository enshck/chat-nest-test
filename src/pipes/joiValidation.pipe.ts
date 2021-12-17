import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';

@Injectable()
export default class JoiValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema<any>) {}

  transform(value: any) {
    const { error } = this.schema.validate(value);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return value;
  }
}
