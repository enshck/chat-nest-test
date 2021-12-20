import {
  Table,
  Column,
  Model,
  IsUUID,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

import User from './User';
import Group from './Group';

@Table
export default class Message extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id: string;

  @Column
  content: string;

  @ForeignKey(() => User)
  @Column
  authorId: string;

  @BelongsTo(() => User)
  author: User;

  @ForeignKey(() => Group)
  @Column
  groupId: string;

  @BelongsTo(() => Group)
  group: User;
}
