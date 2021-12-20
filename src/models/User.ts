import {
  Table,
  Column,
  Model,
  IsUUID,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

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
}
