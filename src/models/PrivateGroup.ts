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
  DataType,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

import User from './User';
import PrivateGroupUser from './PrivateGroupUser';
import PrivateMessage from './PrivateMessage';

@Table
export default class PrivateGroup extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id: string;

  @BelongsToMany(() => User, () => PrivateGroupUser)
  users: User[];

  @HasMany(() => PrivateMessage)
  messages: PrivateMessage[];

  @AllowNull
  @Column(DataType.VIRTUAL)
  get lastMessage(): string {
    const messages = this.getDataValue('messages');

    const messagesData = (messages ?? []).map((elem) => elem.get());

    if (messagesData.length <= 0) {
      return '';
    }

    return messagesData[messagesData.length - 1]?.content ?? null;
  }

  @AllowNull
  @Column(DataType.VIRTUAL)
  get lastMessageCreatedAt(): string {
    const messages = (this.getDataValue('messages') ?? []).map((elem) =>
      elem.get(),
    );

    if (!messages.length) {
      return null;
    }

    const lastMessage = messages[messages.length - 1];

    return lastMessage.createdAt;
  }
}
