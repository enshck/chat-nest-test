import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';

import User from './User';
import Group from './Group';

@Table
class UserGroup extends Model {
  @ForeignKey(() => Group)
  @Column
  groupId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}

export default UserGroup;
