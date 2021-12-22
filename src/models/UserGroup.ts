import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';

import User from './User';
import Group from './Group';

@Table
class UserGroup extends Model {
  @ForeignKey(() => Group)
  @Column
  groupId: string;

  @ForeignKey(() => User)
  @Column
  userId: string;
}

export default UserGroup;
