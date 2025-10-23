import { Controller, Post, Body, UnauthorizedException, BadRequestException, ForbiddenException, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; 
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';


const prisma = new PrismaClient();
const options: SignOptions = {
  expiresIn: (process.env.JWT_EXPIRES ?? '1h') as any,
};

type LoginDto = { email: string; password: string; orgId?: string | null };

@Controller('auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Post('login')
  async login(@Body() dto?: LoginDto) {
    // 1) basic validation
    if (!dto?.email || !dto?.password) {
      throw new BadRequestException('email and password are required');
    }

    // 2) find user and check password
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException();
    }

    // 3) resolve org + role from memberships
    //    If orgId provided, ensure the user is a member; otherwise pick first membership.
    let effectiveOrgId = dto.orgId ?? null;
    let roleForOrg: 'OWNER' | 'ADMIN' | 'VIEWER' | null = null;

    if (effectiveOrgId) {
      const membership = await prisma.membership.findUnique({
        where: { userId_orgId: { userId: user.id, orgId: effectiveOrgId } },
        select: { role: true },
      });
      if (!membership) throw new ForbiddenException('No membership in the selected organization');
      roleForOrg = membership.role;
    } else {
      // pick first membership if the user didn’t select an org
      const first = await prisma.membership.findFirst({
        where: { userId: user.id },
        select: { orgId: true, role: true },
        orderBy: { orgId: 'asc' },
      });
      // it’s okay if user has no orgs—JWT will carry null orgId; client can prompt to join/choose later
      if (first) {
        effectiveOrgId = first.orgId;
        roleForOrg = first.role;
      }
    }

    // 4) sign JWT with sub/email/orgId
    const payload = { sub: String(user.id), email: user.email, orgId: effectiveOrgId };
    // const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES ?? '1h' };
    const access_token = await this.jwt.signAsync(payload as Record<string, unknown>, options);

    return {
      access_token,
      email: user.email,
      orgId: effectiveOrgId,
      role: roleForOrg, // null if user has no memberships
    };
  }
}
