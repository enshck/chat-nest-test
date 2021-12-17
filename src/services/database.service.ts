import { Sequelize } from 'sequelize-typescript';
import variables from 'config/variables';

import User from 'models/User';
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
      sequelize.addModels([User]);
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
];
