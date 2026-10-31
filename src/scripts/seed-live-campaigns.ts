import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  console.log("Setting up Live Campaigns and Tester Interests...");

  // 1. Get Tester Amit Sharma
  const tester = await prisma.testerProfile.findFirst({
    where: { user: { mobile: "9876543210" } },
  });

  if (!tester) {
    throw new Error("Tester Amit Sharma not found!");
  }

  // 2. Fetch all active interests
  const allInterests = await prisma.interest.findMany();
  console.log(`Found ${allInterests.length} interests in database.`);

  // 3. Connect ALL interests to Tester Amit Sharma
  for (const interest of allInterests) {
    await prisma.testerInterest.upsert({
      where: {
        testerProfileId_interestId: {
          testerProfileId: tester.id,
          interestId: interest.id,
        },
      },
      create: {
        testerProfileId: tester.id,
        interestId: interest.id,
      },
      update: {},
    });
  }
  console.log(`Linked all ${allInterests.length} interests to Tester Amit Sharma.`);

  // 4. Ensure 4 Brand Profiles exist
  const brands = await prisma.brandProfile.findMany({
    where: { approvalStatus: "ACTIVE" },
  });

  if (brands.length < 4) {
    throw new Error(`Only ${brands.length} active brands found.`);
  }

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const adminId = admin ? admin.id : 1;

  const now = new Date();
  const nextYear = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

  // 5. Four Premium Live Campaigns for http://localhost:3000/tester/campaigns/live
  const liveCampaigns = [
    {
      brandId: brands[0].id,
      campaignCode: "LIVE-BOAT-AIRDOPES",
      productName: "boAt Airdopes 141 ANC Bluetooth Wireless Earbuds",
      productImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.amazon.in/dp/B09N3ZNHTY",
      marketplace: "Amazon",
      productDescription: "42 Hours Playback, 32dB Active Noise Cancellation, Quad Mics with ENx Tech. Test & keep product + earn reward!",
      earningAmount: 450.0,
      totalSlots: 50,
      filledSlots: 2,
      availableSlots: 48,
      targetGender: "ANY" as const,
      targetState: "any",
      targetCity: "any",
      task4Required: true,
    },
    {
      brandId: brands[1].id,
      campaignCode: "LIVE-MAMA-VITC",
      productName: "Mamaearth Vitamin C Daily Glow Face Cream with Turmeric (80g)",
      productImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.flipkart.com/mamaearth-vitamin-c-daily-glow-face-cream/p/itm12345",
      marketplace: "Flipkart",
      productDescription: "Gives 24-hour hydration and natural radiant glow. Dermatologically tested for all skin types.",
      earningAmount: 350.0,
      totalSlots: 40,
      filledSlots: 1,
      availableSlots: 39,
      targetGender: "ANY" as const,
      targetState: "any",
      targetCity: "any",
      task4Required: false,
    },
    {
      brandId: brands[2].id,
      campaignCode: "LIVE-NOISE-PULSE3",
      productName: "Noise ColorFit Pulse 3 Smartwatch with 1.96\" TFT Display",
      productImage: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.amazon.in/dp/B0C1H4J9K7",
      marketplace: "Amazon",
      productDescription: "Bluetooth Calling, 100+ Sports Modes, 7 Days Battery Life, Metallic Finish Body. Full test feedback needed.",
      earningAmount: 600.0,
      totalSlots: 30,
      filledSlots: 0,
      availableSlots: 30,
      targetGender: "ANY" as const,
      targetState: "any",
      targetCity: "any",
      task4Required: true,
    },
    {
      brandId: brands[3].id,
      campaignCode: "LIVE-PORTRONICS-PAD",
      productName: "Portronics Freedom Fold 15W 3-in-1 Fast Wireless Charger",
      productImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.amazon.in/dp/B0B5D2G7Z1",
      marketplace: "Amazon",
      productDescription: "Foldable wireless fast charging station for smartphones, earbuds and smartwatches with Type-C power input.",
      earningAmount: 500.0,
      totalSlots: 35,
      filledSlots: 3,
      availableSlots: 32,
      targetGender: "ANY" as const,
      targetState: "any",
      targetCity: "any",
      task4Required: true,
    },
  ];

  for (const c of liveCampaigns) {
    const campaign = await prisma.campaign.upsert({
      where: { campaignCode: c.campaignCode },
      create: {
        brandId: c.brandId,
        campaignCode: c.campaignCode,
        productName: c.productName,
        productImage: c.productImage,
        productLink: c.productLink,
        marketplace: c.marketplace,
        productDescription: c.productDescription,
        earningAmount: c.earningAmount,
        currency: "INR",
        totalSlots: c.totalSlots,
        filledSlots: c.filledSlots,
        availableSlots: c.availableSlots,
        targetGender: c.targetGender,
        targetState: c.targetState,
        targetCity: c.targetCity,
        startDate: now,
        endDate: nextYear,
        task4Required: c.task4Required,
        status: "LIVE",
        approvedAt: now,
        approvedBy: adminId,
        createdBy: adminId,
        campaignQuestions: {
          create: [
            {
              questionText: "How was the packaging quality upon delivery?",
              questionType: "SINGLE_CHOICE",
              isRequired: true,
              questionOrder: 1,
            },
            {
              questionText: "Rate the overall build quality and value for money.",
              questionType: "TEXT",
              isRequired: true,
              questionOrder: 2,
            },
          ],
        },
      },
      update: {
        status: "LIVE",
        availableSlots: c.availableSlots,
        startDate: now,
        endDate: nextYear,
        targetState: "any",
        targetCity: "any",
        targetGender: "ANY",
      },
    });

    // Make sure Tester has NOT yet applied to these 4 Live Campaigns so canApply is TRUE
    await prisma.campaignApplication.deleteMany({
      where: {
        testerProfileId: tester.id,
        campaignId: campaign.id,
      },
    });

    console.log(`✅ [LIVE CAMPAIGN READY]: ${c.productName} (Code: ${c.campaignCode}, Earning: Rs. ${c.earningAmount})`);
  }

  console.log("\n========================================================");
  console.log("All 4 Live Campaigns are 100% READY on http://localhost:3000/tester/campaigns/live");
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
