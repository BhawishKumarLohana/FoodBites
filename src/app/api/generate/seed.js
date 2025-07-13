const { PrismaClient } = require('../../../generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create a Restaurant User
 const foodTitles = [
    'Extra Char Siu Bao',
    'Leftover Spring Rolls',
    'Unused Fish Balls',
    'Surplus Chicken Wings',
    'Steamed Veg Dumplings',
    'Pineapple Buns',
    'Bamboo Rice Portions',
    'Lotus Leaf Sticky Rice',
    'Chow Mein Boxes',
    'Dim Sum Platter',
  ];

  for (let i = 1; i <= 10; i++) {
    const restEmail = `rest${i}@hkfood.hk`;
    const orgEmail = `org${i}@care.hk`;
    const restName = `Rest-${i}-${Math.floor(Math.random() * 1000)}`;
    const orgName = `Org-${i}-${Math.floor(Math.random() * 1000)}`;
    const foodTitle = foodTitles[i % foodTitles.length] + ` ${i}`;

    // Create Restaurant User
    const restUser = await prisma.user.create({
      data: {
        type: 'RESTAURANT',
        email: restEmail,
        password: 'password123',
        address: `Street ${i}`,
        country: 'Hong Kong',
        city: 'Kowloon',
        primary_PhoneN: `+852555000${i}`,
        secondary_PhoneN: `+852555999${i}`,
        restaurant: {
          create: {
            ResName: restName,
            openTime: '08:00',
            closeTime: '22:00',
            description: `Restaurant ${i} description`,
          },
        },
      },
    });

    // Create Organization User
    const orgUser = await prisma.user.create({
      data: {
        type: 'ORGANIZATION',
        email: orgEmail,
        password: 'password123',
        address: `Queensway ${i}`,
        country: 'Hong Kong',
        city: 'Central',
        primary_PhoneN: `+852444000${i}`,
        secondary_PhoneN: `+852444999${i}`,
        organization: {
          create: {
            orgName: orgName,
            regNumber: 10000 + i,
            description: `Helping HK ${i}`,
            type: 'NGO',
          },
        },
      },
    });

    // Create Food Listing
    const foodItem = await prisma.food.create({
      data: {
        DonatedBy: restUser.userId,
        title: foodTitle,
        isDelivery:true,
        quantity:"20", // 5–25
        deadline: new Date(Date.now() + 3600 * 1000 * 24), // 1 day
      },
    });

    // Create Food Claim
    const foodClaim = await prisma.foodClaim.create({
      data: {
        foodId: foodItem.foodId,
        claimedBy: orgUser.userId,
        deliver: Math.random() > 0.5,
        specialInstruction: `Deliver before ${8 + i % 4}pm`,
        status: 'PENDING',
        claimedAt: new Date(),
      },
    });

    // Update food claimId
    await prisma.food.update({
      where: { foodId: foodItem.foodId },
      data: { claimId: foodClaim.claimId },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: orgUser.userId,
        action: 'CLAIM_FOOD',
      },
    });

    console.log(`✅ Seeded set ${i}`);
  }

  

  console.log('✅ Seeding completed with Hong Kong data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
