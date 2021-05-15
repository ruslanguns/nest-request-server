import { PrismaClient } from '.prisma/client';
import * as fs from 'fs';
import { join } from 'path';

const file = join(process.cwd(), 'src', 'data', 'data.json');
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

const prisma = new PrismaClient();

interface JobCard {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  birthday: string;
  email: string;
  ni: string;
  phone: string;
  learnerId: string;
  jobCards: JobCard[];
}

async function main() {
  const result = Promise.all(
    data.map(
      async ({
        firstName,
        lastName,
        birthday,
        jobCards,
        learnerId,
        phone,
        ni,
        email,
      }: User) =>
        await prisma.user.create({
          data: {
            firstName,
            lastName,
            birthday: new Date(birthday),
            phone,
            ni,
            learnerId,
            email,
            jobCards: {
              create: jobCards.map(({ name }) => ({
                name,
              })),
            },
          },
        }),
    ),
  );

  await result;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
