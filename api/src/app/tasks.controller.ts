import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtAuthGuard } from '@turbovets/auth'; // your UserCtx decorator
import { OrgRbacService } from '@turbovets/rbac';
import { UserCtx } from 'auth/src/lib/org.context';

const prisma = new PrismaClient();

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private rbac: OrgRbacService) {}

  @Post()
  async create(
    @UserCtx() user: any,
    @Body() dto: { title: string; description?: string; orgId?: string }
  ) {
    // prefer explicit orgId from client; fall back to user’s effective orgId (membership)
    const orgId = dto.orgId ?? user?.orgId ?? user?.effectiveOrgId;

    if (!orgId) {
      // Still undefined? Bail clearly instead of letting Prisma throw.
      throw new BadRequestException('orgId is required or must be resolvable from user context');
    }

    // RBAC: require ADMIN/OWNER on that org
    await this.rbac.assertCan(String(user.sub), orgId, ['ADMIN', 'OWNER']);

    return prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        orgId,
        status: 'TODO',
        order: 0,
        createdById: String(user.sub),
      },
    });
  }
}
