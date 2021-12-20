import {
  Table,
  Column,
  Model,
  IsUUID,
  PrimaryKey,
  Default,
  AllowNull,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

import UserGroup from './UserGroup';
import Group from './Group';
import Message from './Message';

@Table
export default class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column
  userName: string;

  @AllowNull
  @Column
  avatar: string;

  @Column
  password: string;

  @AllowNull
  @Column
  token: string;

  @HasMany(() => Group)
  createdGroups: Group[];

  @HasMany(() => Message)
  messages: Message[];

  @BelongsToMany(() => Group, () => UserGroup)
  groups: Group[];
}