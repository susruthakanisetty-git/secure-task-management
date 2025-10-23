import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { TasksController } from './tasks.controller';
import { RbacModule , OrgRbacService } from '@turbovets/rbac';

@Module({
  imports: [
    RbacModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({ secret: process.env.JWT_SECRET })
  ],
  controllers: [AuthController,AppController,TasksController],
  providers: [JwtStrategy,AppService,OrgRbacService],
})
export class AppModule {}
