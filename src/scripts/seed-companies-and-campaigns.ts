import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  console.log("Starting Company & Campaign Seeding...");

  const password = "Password@123";
  const hashedPassword = await bcrypt.hash(password, 12);

  // 1. Get or create Admin user
  let admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        role: "ADMIN",
        email: "admin@revtail.in",
        mobile: "9999999999",
        password: hashedPassword,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        mobileVerifiedAt: new Date(),
        adminProfile: {
          create: {
            fullName: "Revtail Super Admin",
            designation: "Head Administrator",
          },
        },
      },
    });
  }

  // 2. Ensure Interests
  const categories = [
    "Electronics",
    "Beauty & Personal Care",
    "Smart Wearables",
    "Home & Kitchen",
  ];

  const interestMap: Record<string, number> = {};
  for (const name of categories) {
    let interest = await prisma.interest.findUnique({ where: { name } });
    if (!interest) {
      interest = await prisma.interest.create({
        data: { name, isActive: true },
      });
    }
    interestMap[name] = interest.id;
  }

  // 3. Define 4 Companies (Brands)
  const companiesData = [
    {
      companyName: "boAt Lifestyle",
      email: "boat@revtail.in",
      mobile: "9811111111",
      companyType: "D2C Audio & Accessories",
      categoryName: "Electronics",
      website: "https://www.boat-lifestyle.com",
      pocFullName: "Aman Gupta",
      designation: "Co-Founder & CMO",
    },
    {
      companyName: "Mamaearth (Honasa Consumer)",
      email: "mamaearth@revtail.in",
      mobile: "9822222222",
      companyType: "D2C Beauty & Skincare",
      categoryName: "Beauty & Personal Care",
      website: "https://mamaearth.in",
      pocFullName: "Ghazal Alagh",
      designation: "Co-Founder",
    },
    {
      companyName: "Noise Technologies",
      email: "noise@revtail.in",
      mobile: "9833333333",
      companyType: "Smart Wearables & Tech",
      categoryName: "Smart Wearables",
      website: "https://www.gonoise.com",
      pocFullName: "Amit Khatri",
      designation: "Managing Director",
    },
    {
      companyName: "Portronics Digital",
      email: "portronics@revtail.in",
      mobile: "9844444444",
      companyType: "Consumer Electronics",
      categoryName: "Electronics",
      website: "https://www.portronics.com",
      pocFullName: "Jasmeet Singh",
      designation: "VP Marketing",
    },
  ];

  const brandProfiles: any[] = [];

  for (const c of companiesData) {
    let user = await prisma.user.findUnique({
      where: { email: c.email },
      include: { brandProfile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          role: "BRAND",
          email: c.email,
          mobile: c.mobile,
          password: hashedPassword,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
          mobileVerifiedAt: new Date(),
          brandProfile: {
            create: {
              companyName: c.companyName,
              companyType: c.companyType,
              categoryId: interestMap[c.categoryName] || interestMap["Electronics"],
              website: c.website,
              pocFullName: c.pocFullName,
              pocMobile: c.mobile,
              designation: c.designation,
              approvalStatus: "ACTIVE",
              approvedAt: new Date(),
            },
          },
        },
        include: { brandProfile: true },
      });
      console.log(`Created Company: ${c.companyName} (${c.email})`);
    } else {
      console.log(`Company already exists: ${c.companyName}`);
    }

    if (user.brandProfile) {
      brandProfiles.push(user.brandProfile);
    }
  }

  // 4. Get Tester Amit Sharma
  const tester = await prisma.testerProfile.findFirst({
    where: { user: { mobile: "9876543210" } },
  });

  if (!tester) {
    throw new Error("Tester Amit Sharma not found! Run npm run seed first.");
  }

  // 5. Define 4 Campaigns
  const now = new Date();
  const nextMonth = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const campaignsData = [
    {
      brandId: brandProfiles[0].id,
      campaignCode: "REV-BOAT-141",
      productName: "boAt Airdopes 141 ANC True Wireless Earbuds",
      productImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.amazon.in/dp/B09N3ZNHTY",
      marketplace: "Amazon",
      productDescription: "Experience 42 hours playback, 32dB Active Noise Cancellation, and Beast mode for gaming with boAt Airdopes 141 ANC.",
      earningAmount: 450.0,
      totalSlots: 50,
      filledSlots: 0,
      availableSlots: 50,
      targetGender: "ANY" as const,
      targetState: "any",
      targetCity: "any",
      task4Required: true,
      status: "LIVE" as const,
      purpose: "LIVE_CAMPAIGN",
    },
    {
      brandId: brandProfiles[1].id,
      campaignCode: "REV-MAMA-GLOW",
      productName: "Mamaearth Vitamin C Daily Glow Face Cream (80g)",
      productImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.flipkart.com/mamaearth-vitamin-c-daily-glow-face-cream/p/itm12345",
      marketplace: "Flipkart",
      productDescription: "Get radiant glow with Vitamin C and Turmeric. Lightweight daily moisturizing face cream suitable for all skin types.",
      earningAmount: 350.0,
      totalSlots: 40,
      filledSlots: 0,
      availableSlots: 40,
      targetGender: "ANY" as const,
      targetState: "Delhi",
      targetCity: "New Delhi",
      task4Required: false,
      status: "LIVE" as const,
      purpose: "LIVE_CAMPAIGN",
    },
    {
      brandId: brandProfiles[2].id,
      campaignCode: "REV-NOISE-PULSE",
      productName: "Noise ColorFit Pulse 3 Bluetooth Smartwatch (1.96-inch)",
      productImage: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.amazon.in/dp/B0C1H4J9K7",
      marketplace: "Amazon",
      productDescription: "1.96 inch TFT display, Bluetooth calling, 100+ sports modes, and up to 7 days battery life.",
      earningAmount: 600.0,
      totalSlots: 30,
      filledSlots: 1,
      availableSlots: 29,
      targetGender: "ANY" as const,
      targetState: "any",
      targetCity: "any",
      task4Required: true,
      status: "LIVE" as const,
      purpose: "MY_APPLICATION_PENDING",
    },
    {
      brandId: brandProfiles[3].id,
      campaignCode: "REV-PORT-CHARGE",
      productName: "Portronics Freedom Fold 15W Wireless Fast Charger",
      productImage: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
      productLink: "https://www.amazon.in/dp/B0B5D2G7Z1",
      marketplace: "Amazon",
      productDescription: "Foldable 3-in-1 fast wireless charging dock for smartphones, earphones, and smartwatches.",
      earningAmount: 500.0,
      totalSlots: 25,
      filledSlots: 1,
      availableSlots: 24,
      targetGender: "ANY" as const,
      targetState: "any",
      targetCity: "any",
      task4Required: true,
      status: "LIVE" as const,
      purpose: "ONGOING_CAMPAIGN",
    },
  ];

  for (const c of campaignsData) {
    let campaign = await prisma.campaign.findUnique({
      where: { campaignCode: c.campaignCode },
    });

    if (!campaign) {
      campaign = await prisma.campaign.create({
        data: {
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
          endDate: nextMonth,
          task4Required: c.task4Required,
          status: c.status,
          approvedAt: now,
          approvedBy: admin.id,
          createdBy: admin.id,
          campaignQuestions: {
            create: [
              {
                questionText: "How was the packaging quality upon arrival?",
                questionType: "SINGLE_CHOICE",
                isRequired: true,
                questionOrder: 1,
              },
              {
                questionText: "What feature did you like the most about this product?",
                questionType: "TEXT",
                isRequired: true,
                questionOrder: 2,
              },
            ],
          },
        },
      });
      console.log(`Created Campaign: ${c.productName} (${c.campaignCode})`);
    } else {
      console.log(`Campaign already exists: ${c.campaignCode}`);
    }

    // Link with Tester Amit Sharma according to purpose
    if (c.purpose === "MY_APPLICATION_PENDING") {
      const existingApp = await prisma.campaignApplication.findUnique({
        where: {
          testerProfileId_campaignId: {
            testerProfileId: tester.id,
            campaignId: campaign.id,
          },
        },
      });
      if (!existingApp) {
        await prisma.campaignApplication.create({
          data: {
            testerProfileId: tester.id,
            campaignId: campaign.id,
            status: "PENDING",
            appliedAt: new Date(),
          },
        });
        console.log(`  -> Applied Tester to ${campaign.campaignCode} (Status: PENDING) for 'My Campaigns'`);
      }
    }

    if (c.purpose === "ONGOING_CAMPAIGN") {
      let existingApp = await prisma.campaignApplication.findUnique({
        where: {
          testerProfileId_campaignId: {
            testerProfileId: tester.id,
            campaignId: campaign.id,
          },
        },
      });
      if (!existingApp) {
        existingApp = await prisma.campaignApplication.create({
          data: {
            testerProfileId: tester.id,
            campaignId: campaign.id,
            status: "APPROVED",
            appliedAt: new Date(),
            reviewedAt: new Date(),
            reviewedBy: admin.id,
          },
        });
      }

      const existingTesterCamp = await prisma.testerCampaign.findUnique({
        where: {
          testerProfileId_campaignId: {
            testerProfileId: tester.id,
            campaignId: campaign.id,
          },
        },
      });

      if (!existingTesterCamp) {
        const tc = await prisma.testerCampaign.create({
          data: {
            testerProfileId: tester.id,
            campaignId: campaign.id,
            applicationId: existingApp.id,
            status: "ONGOING",
            currentTask: 1,
            earningAmount: campaign.earningAmount,
            startedAt: new Date(),
            tasks: {
              create: [
                { taskNumber: 1, status: "AVAILABLE", unlockedAt: new Date() },
                { taskNumber: 2, status: "LOCKED" },
                { taskNumber: 3, status: "LOCKED" },
                { taskNumber: 4, status: "LOCKED" },
              ],
            },
          },
        });
        console.log(`  -> Enrolled Tester in ${campaign.campaignCode} (Status: ONGOING, Task 1 AVAILABLE) for 'Ongoing Active Campaigns'`);
      }
    }
  }

  console.log("\n==============================================");
  console.log("SUCCESS! Created 4 Companies & 4 Campaigns!");
  console.log("1. boAt Lifestyle          -> boAt Airdopes 141 (Live)");
  console.log("2. Mamaearth               -> Vitamin C Face Cream (Live)");
  console.log("3. Noise Technologies      -> Noise Smartwatch (In 'My Campaigns' - Pending)");
  console.log("4. Portronics Digital      -> Wireless Charger (In 'Ongoing Active Campaigns' - Task 1 Unlocked)");
  console.log("==============================================\n");
}

main()
  .catch((err) => {
    console.error("Error creating companies & campaigns:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
