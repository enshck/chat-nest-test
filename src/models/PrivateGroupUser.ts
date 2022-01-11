import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';

import User from './User';
import PrivateGroup from './PrivateGroup';

@Table
class PrivateGroupUser extends Model {
  @ForeignKey(() => PrivateGroup)
  @Column
  groupId: string;

  @ForeignKey(() => User)
  @Column
  userId: string;
}

export default PrivateGroupUser;
