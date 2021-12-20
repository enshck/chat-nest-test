import { Module } from '@nestjs/common';

import AuthController from 'controllers/auth.controller';
import AuthService from 'services/auth.service';
import UserController from 'controllers/user.controller';
import UserService from 'services/user.sevice';

@Module({
  imports: [],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService],
})
export default class AuthModule {}
