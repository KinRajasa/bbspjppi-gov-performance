import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Checking Roles ===');
  const roles = await prisma.role.findMany({
    select: { id: true, name: true, description: true }
  });
  console.log('Roles in database:', roles);
  
  console.log('\n=== Checking Users ===');
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      name: true, 
      email: true,
      roles: {
        select: {
          role: { select: { name: true } }
        }
      }
    }
  });
  console.log('Users in database:', users);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
