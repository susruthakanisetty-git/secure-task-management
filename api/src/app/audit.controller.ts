import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from '@turbovets/auth';
import { UserCtx } from '@turbovets/auth';
import { OrgRbacService } from '@turbovets/rbac';

const prisma = new PrismaClient();

@Controller('audit-log')
// @UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private rbac: OrgRbacService) {}

  @Get()
  async list(@UserCtx() u?: { userId: string; orgId?: string | null }) {
    // For simplicity, show all logs but enforce Owner/Admin in any org they belong to
    // You can refine by orgId filter if you prefer
    const memberships = await prisma.membership.findMany({ where: { userId: u!.userId } });
    const orgIds = memberships.map(m => m.orgId);
    // If user has at least ADMIN in any, allow; else forbid
    for (const m of memberships) {
      const role = await this.rbac.resolveRole(u!.userId, m.orgId);
      if (role === 'OWNER' || role === 'ADMIN') {
        return prisma.auditLog.findMany({ orderBy: { at: 'desc' }, take: 200 });
      }
    }
    // none matched
    throw new (await import('@nestjs/common')).ForbiddenException('Audit requires Owner/Admin');
  }

  @Get()
    async listTasks(@UserCtx() user: any) {
        console.log('Current user:', user);
    }
}
