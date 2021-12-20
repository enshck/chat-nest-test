import { Sequelize } from 'sequelize-typescript';
import variables from 'config/variables';

import User from 'models/User';
import Group from 'models/Group';
import UserGroup from 'models/UserGroup';
import Message from 'models/Message';
import { dbTables } from 'const/dbTables';

export const databaseServices = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        database: variables.dbName,
        username: variables.dbUser,
        password: variables.dbPassword,
      });
      sequelize.addModels([User, Group, UserGroup, Message]);
      await sequelize.sync();
      return sequelize;
    },
  },
  {
    provide: dbTables.USER_TABLE,
    useFactory: async () => {
      return User;
    },
    inject: ['SEQUELIZE'],
  },
  {
    provide: dbTables.GROUP_TABLE,
    useFactory: async () => {
      return Group;
    },
    inject: ['SEQUELIZE'],
  },
  {
    provide: dbTables.USER_GROUP_TABLE,
    useFactory: async () => {
      return UserGroup;
    },
    inject: ['SEQUELIZE'],
  },
  {
    provide: dbTables.USER_GROUP_TABLE,
    useFactory: async () => {
      return UserGroup;
    },
    inject: ['SEQUELIZE'],
  },
  {
    provide: dbTables.MESSAGE_TABLE,
    useFactory: async () => {
      return Message;
    },
    inject: ['SEQUELIZE'],
  },
];
