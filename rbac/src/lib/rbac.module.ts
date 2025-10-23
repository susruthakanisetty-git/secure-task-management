import { Module } from '@nestjs/common';
import { OrgRbacService } from './org-rbac.service';
import { PrismaModule  } from './prisma.module';

@Module({
    imports: [PrismaModule],
  providers: [OrgRbacService],
  exports:   [OrgRbacService],
})
export class RbacModule {}
