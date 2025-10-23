import { PrismaClient, OrgRole, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hash(pw, 10);

async function main() {
  const email = 'admin@local';
  const passwordHash = await bcrypt.hash('admin123', 10);

  // upsert admin user
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash },
    create: { email, password: passwordHash },
  });

 const org = await prisma.organization.upsert({
  where: { name: 'TurboVets HQ' },
  update: {},
  create: { name: 'TurboVets HQ' },
});

await prisma.membership.upsert({
  where: { userId_orgId: { userId: user.id, orgId: org.id } },
  update: { role: 'OWNER' },
  create: { userId: user.id, orgId: org.id, role: 'OWNER' },
});

  console.log('Seeded:', { email, orgId: org.id });
}

main().finally(() => prisma.$disconnect());