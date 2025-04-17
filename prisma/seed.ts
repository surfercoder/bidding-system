import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding...`);

  // Create 10 users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      },
    });
    users.push(user);
    console.log(`Created user with id: ${user.id}`);
  }

  // Create 100 collections
  const collections = [];
  for (let i = 0; i < 100; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const collection = await prisma.collection.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        stock: faker.number.int({ min: 1, max: 100 }),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        userId: randomUser.id,
      },
    });
    collections.push(collection);
    console.log(`Created collection with id: ${collection.id}`);
  }

  // Create 10 bids per collection
  for (const collection of collections) {
    for (let i = 0; i < 10; i++) {
      const bidder = users.find(user => user.id !== collection.userId) || users[0];
      const bid = await prisma.bid.create({
        data: {
          price: parseFloat(faker.commerce.price({ min: collection.price * 0.8, max: collection.price * 1.2 })),
          userId: bidder.id,
          collectionId: collection.id,
          status: i === 0 ? 'ACCEPTED' : i === 1 ? 'REJECTED' : 'PENDING',
        },
      });
      console.log(`Created bid with id: ${bid.id}`);
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });