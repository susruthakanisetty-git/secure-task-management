// rbac/src/lib/org-rbac.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { OrgRole } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class OrgRbacService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolve a user's role for the target org (walks up parents).
   * If targetOrgId is undefined, we fallback to the user's first membership org.
   */
  async resolveRole(userId: string, targetOrgId?: string): Promise<OrgRole | null> {
    const first = await this.prisma.membership.findFirst({
      where: { userId },
      select: { role: true, orgId: true, org: { select: { parentId: true } } },
      orderBy: { id: 'asc' },
    });

    if (!first && !targetOrgId) return null; // user has no orgs and none provided

    const startOrgId = targetOrgId ?? first!.orgId;

    let current = await this.prisma.organization.findUnique({
      where: { id: startOrgId },
      select: { id: true, parentId: true },
    });

    if (!current) throw new ForbiddenException('Organization not found');

    while (current) {
      const mem = await this.prisma.membership.findUnique({
        where: {
          userId_orgId: {
            userId,
            orgId: current.id,
          },
        },
        select: { role: true },
      });

      if (mem) return mem.role as OrgRole;

      current = current.parentId
        ? await this.prisma.organization.findUnique({
            where: { id: current.parentId },
            select: { id: true, parentId: true },
          })
        : null;
    }

    return null;
  }

  async assertCan(userId: string, targetOrgId?: string, required: OrgRole[] = ['OWNER', 'ADMIN']) {
    const role = await this.resolveRole(userId, targetOrgId);
    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }
  }
}
