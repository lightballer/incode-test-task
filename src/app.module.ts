import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'incode-test-task-user',
      password: 'incode-test-task-password',
      database: 'incode-test-task-db',
      synchronize: true,
      entities: [User],
    }),
    UsersModule,
  ],
})
export class AppModule {}
