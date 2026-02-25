const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const permissions = [
  { key: "dashboard.view", description: "View dashboard", module: "dashboard" },
  { key: "events.view", description: "View events", module: "events" },
  { key: "events.create", description: "Create events", module: "events" },
  { key: "events.edit", description: "Edit events", module: "events" },
  { key: "events.delete", description: "Delete events", module: "events" },
  { key: "events.publish", description: "Publish events", module: "events" },
  { key: "events.approve", description: "Approve events", module: "events" },
  { key: "olympiads.view", description: "View olympiads", module: "olympiads" },
  { key: "olympiads.create", description: "Create olympiads", module: "olympiads" },
  { key: "olympiads.edit", description: "Edit olympiads", module: "olympiads" },
  { key: "olympiads.publish", description: "Publish olympiads", module: "olympiads" },
  { key: "olympiads.approve", description: "Approve olympiads", module: "olympiads" },
  { key: "registrations.view", description: "View registrations", module: "registrations" },
  { key: "registrations.export", description: "Export registrations", module: "registrations" },
  { key: "registrations.edit_status", description: "Update registration status", module: "registrations" },
  { key: "organizations.view", description: "View organizations", module: "organizations" },
  { key: "organizations.approve", description: "Approve organizations", module: "organizations" },
  { key: "organizations.edit", description: "Edit organizations", module: "organizations" },
  { key: "payments.view", description: "View payments", module: "payments" },
  { key: "payments.refund", description: "Refund payments", module: "payments" },
  { key: "payouts.view", description: "View payouts", module: "payouts" },
  { key: "payouts.manage", description: "Manage payouts", module: "payouts" },
  { key: "results.publish", description: "Publish results", module: "results" },
  { key: "certificates.issue", description: "Issue certificates", module: "certificates" },
  { key: "content.view", description: "View content", module: "content" },
  { key: "content.create", description: "Create content", module: "content" },
  { key: "content.edit", description: "Edit content", module: "content" },
  { key: "content.publish", description: "Publish content", module: "content" },
  { key: "settings.view", description: "View settings", module: "settings" },
  { key: "settings.manage", description: "Manage settings", module: "settings" },
  { key: "rbac.view", description: "View roles and permissions", module: "rbac" },
  { key: "rbac.manage", description: "Manage roles and permissions", module: "rbac" },
  { key: "audit.view", description: "View audit logs", module: "audit" }
];

const roleTemplates = [
  {
    name: "Super Admin",
    description: "Full access to everything.",
    isSystem: true,
    permissions: permissions.map((permission) => permission.key)
  },
  {
    name: "Admin",
    description: "All access except managing RBAC.",
    isSystem: true,
    permissions: permissions
      .filter((permission) => permission.key !== "rbac.manage")
      .map((permission) => permission.key)
  },
  {
    name: "Content Manager",
    description: "Manages content and can view settings.",
    isSystem: true,
    permissions: ["content.view", "content.create", "content.edit", "content.publish", "settings.view"]
  },
  {
    name: "Support",
    description: "Handles registrations and event visibility.",
    isSystem: true,
    permissions: [
      "registrations.view",
      "registrations.export",
      "registrations.edit_status",
      "events.view",
      "dashboard.view"
    ]
  },
  {
    name: "Finance",
    description: "Payments and payout management.",
    isSystem: true,
    permissions: [
      "payments.view",
      "payments.refund",
      "payouts.view",
      "payouts.manage",
      "dashboard.view"
    ]
  },
  {
    name: "Organizer",
    description: "Manages own olympiads and registrations.",
    isSystem: true,
    permissions: [
      "olympiads.view",
      "olympiads.create",
      "olympiads.edit",
      "olympiads.publish",
      "registrations.view"
    ]
  },
  {
    name: "Participant",
    description: "Participant account for mobile access.",
    isSystem: true,
    permissions: []
  },
  {
    name: "Parent",
    description: "Guardian account for multi-child access.",
    isSystem: true,
    permissions: []
  }
];

async function seedPermissions() {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        description: permission.description,
        module: permission.module
      },
      create: permission
    });
  }
}

async function seedRoles() {
  for (const role of roleTemplates) {
    const persistedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        isSystem: role.isSystem
      },
      create: {
        name: role.name,
        description: role.description,
        isSystem: role.isSystem
      }
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: persistedRole.id }
    });

    const permissionRows = await prisma.permission.findMany({
      where: { key: { in: role.permissions } },
      select: { id: true }
    });

    if (permissionRows.length) {
      await prisma.rolePermission.createMany({
        data: permissionRows.map((permission) => ({
          roleId: persistedRole.id,
          permissionId: permission.id
        }))
      });
    }
  }
}

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@bond.local";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isActive: true },
    create: {
      email,
      passwordHash,
      isActive: true
    }
  });

  const superAdminRole = await prisma.role.findFirst({
    where: { name: "Super Admin" }
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id
      }
    });
  }
}

async function seedOrganizerUser(organizationId) {
  const email = "organizer@bond.local";
  const password = "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const organizerUser = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isActive: true },
    create: {
      email,
      passwordHash,
      isActive: true
    }
  });

  const organizerRole = await prisma.role.findFirst({
    where: { name: "Organizer" }
  });

  if (organizerRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: organizerUser.id,
          roleId: organizerRole.id
        }
      },
      update: {},
      create: {
        userId: organizerUser.id,
        roleId: organizerRole.id
      }
    });
  }

  await prisma.organizer.upsert({
    where: { organizationId },
    update: {
      ownerUserId: organizerUser.id,
      legalName: "Bond Academy LLC"
    },
    create: {
      organizationId,
      ownerUserId: organizerUser.id,
      legalName: "Bond Academy LLC"
    }
  });

  return organizerUser;
}

async function seedParticipantUser() {
  const phone = process.env.PARTICIPANT_PHONE || "+998937525592";
  const password = process.env.PARTICIPANT_PASSWORD || "bondtest1";
  const passwordHash = await bcrypt.hash(password, 12);

  const participantUser = await prisma.user.upsert({
    where: { phone },
    update: { passwordHash, isActive: true, preferredLanguage: "UZ" },
    create: {
      phone,
      passwordHash,
      isActive: true,
      preferredLanguage: "UZ"
    }
  });

  const participantRole = await prisma.role.findFirst({
    where: { name: "Participant" }
  });

  if (participantRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: participantUser.id,
          roleId: participantRole.id
        }
      },
      update: {},
      create: {
        userId: participantUser.id,
        roleId: participantRole.id
      }
    });
  }

  const existingProfile = await prisma.studentProfile.findFirst({
    where: { guardianId: participantUser.id }
  });

  const profile =
    existingProfile ??
    (await prisma.studentProfile.create({
      data: {
        guardianId: participantUser.id,
        fullName: "Test Student",
        grade: "5",
        school: "Bond Academy",
        region: "Tashkent",
        language: "UZ",
        parentPhone: phone
      }
    }));

  const existingCount = await prisma.studentProfile.count({
    where: { guardianId: participantUser.id }
  });

  if (existingCount < 3) {
    await prisma.studentProfile.createMany({
      data: [
        {
          guardianId: participantUser.id,
          fullName: "Madina Karimova",
          grade: "7",
          school: "Tashkent School 12",
          region: "Tashkent",
          language: "UZ",
          parentPhone: phone
        },
        {
          guardianId: participantUser.id,
          fullName: "Azizbek Umarov",
          grade: "9",
          school: "Samarkand Lyceum",
          region: "Samarkand",
          language: "UZ",
          parentPhone: phone
        }
      ]
    });
  }

  await prisma.user.update({
    where: { id: participantUser.id },
    data: { activeStudentProfileId: profile.id }
  });

  return participantUser;
}

async function seedSettings() {
  await prisma.siteSetting.upsert({
    where: { key: "commissionRate" },
    update: { value: 0.08 },
    create: {
      key: "commissionRate",
      value: 0.08
    }
  });
}

async function seedSiteBlocks() {
  const blocks = ["hero", "about", "footer", "contact"];
  const locales = ["UZ", "RU", "EN"];
  const blockContent = {
    hero: {
      badge: "International Standard",
      title: "BOND Marketplace",
      subtitle: "Olympiads, contests, camps, and travel programs in one place.",
      ctaPrimary: "Browse events",
      ctaSecondary: "Admin login"
    },
    about: {
      title: "About BOND",
      body: "BOND connects students and organizers with transparent, scalable competition management."
    },
    footer: {
      text: "International-standard competition platform."
    },
    contact: {
      phone: "+998 (00) 000-00-00",
      email: "hello@bond.local",
      address: "Tashkent, Uzbekistan",
      telegram: "@bond_admin",
      instagram: "@bond"
    }
  };

  for (const code of blocks) {
    const block = await prisma.siteBlock.upsert({
      where: { code },
      update: {},
      create: { code }
    });

    for (const locale of locales) {
      await prisma.siteBlockTranslation.upsert({
        where: {
          blockId_locale: {
            blockId: block.id,
            locale
          }
        },
        update: {},
        create: {
          blockId: block.id,
          locale,
          data: blockContent[code]
        }
      });
    }
  }
}

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedAdminUser();
  await seedParticipantUser();
  await seedSettings();
  await seedSiteBlocks();

  const existingOrg = await prisma.organization.findFirst({
    where: { name: "Bond Academy" }
  });

  const organization =
    existingOrg ??
    (await prisma.organization.create({
      data: {
        name: "Bond Academy",
        status: "APPROVED",
        contacts: {
          phone: "+998 (00) 000-00-00",
          email: "academy@bond.local"
        }
      }
    }));

  const existingEvent = await prisma.event.findFirst({
    where: {
      organizerOrgId: organization.id,
      type: "OLYMPIAD",
      city: "Tashkent"
    }
  });

  if (!existingEvent) {
    await prisma.event.create({
      data: {
        type: "OLYMPIAD",
        status: "PUBLISHED",
        organizerOrgId: organization.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        city: "Tashkent",
        price: 250000,
        currency: "UZS",
        capacity: 120,
        translations: {
          create: [
            {
              locale: "UZ",
              title: "BOND Olympiad",
              subtitle: "Season opener",
              description: "Regional olympiad for ambitious students.",
              rules: "Bring ID and arrive early.",
              seoTitle: "BOND Olympiad",
              seoDescription: "Regional olympiad for ambitious students."
            },
            {
              locale: "RU",
              title: "BOND Olympiad",
              subtitle: "Season opener",
              description: "Regional olympiad for ambitious students.",
              rules: "Bring ID and arrive early.",
              seoTitle: "BOND Olympiad",
              seoDescription: "Regional olympiad for ambitious students."
            },
            {
              locale: "EN",
              title: "BOND Olympiad",
              subtitle: "Season opener",
              description: "Regional olympiad for ambitious students.",
              rules: "Bring ID and arrive early.",
              seoTitle: "BOND Olympiad",
              seoDescription: "Regional olympiad for ambitious students."
            }
          ]
        }
      }
    });
  }

  const organizerUser = await seedOrganizerUser(organization.id);

  const organizerProfile = await prisma.organizer.findFirst({
    where: { organizationId: organization.id }
  });

  if (organizerProfile) {
    const existingCount = await prisma.olympiad.count({
      where: { organizerId: organizerProfile.id }
    });

    if (existingCount < 3) {
      const olympiadSeeds = [
        {
          subject: "ENGLISH",
          gradeGroup: "G5_7",
          level: "A2",
          format: "OFFLINE",
          region: "Tashkent",
          title: "BOND English Olympiad",
          subtitle: "Spring session",
          coverImageUrl: "/uploads/42686198-326e-4cd8-8cb8-0c859335d3ca.jpg"
        },
        {
          subject: "MATH",
          gradeGroup: "G8_9",
          level: "B1",
          format: "ONLINE",
          region: "Samarkand",
          title: "Math Challenge",
          subtitle: "Online qualifier",
          coverImageUrl: "/uploads/51fe60af-8c1e-45f6-b45f-97f47ac962aa.jpg"
        },
        {
          subject: "IT",
          gradeGroup: "G10_11",
          level: "B2",
          format: "STAGED",
          region: "Tashkent",
          title: "IT & Coding Olympiad",
          subtitle: "Stage 1",
          coverImageUrl: "/uploads/f1a7c26b-6fea-4f4e-8c90-d3067812824d.jpg"
        }
      ];

      for (const item of olympiadSeeds) {
        await prisma.olympiad.create({
          data: {
            organizerId: organizerProfile.id,
            type: "OLYMPIAD",
            status: "PUBLISHED",
            subject: item.subject,
            gradeGroup: item.gradeGroup,
            level: item.level,
            format: item.format,
            region: item.region,
            language: "UZ",
            startDate: new Date(),
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            location: item.region,
            price: 150000,
            currency: "UZS",
            capacity: 80,
            coverImageUrl: item.coverImageUrl,
            rules: "Bring your ID and arrive 30 minutes early.",
            prizes: "Certificates and awards for top performers.",
            certificateUrl: null,
            translations: {
              create: [
                {
                  locale: "UZ",
                  title: item.title,
                  subtitle: item.subtitle,
                  description: "Yangi mavsum uchun olimpiyada.",
                  rules: "Hujjat bilan keling.",
                  prizes: "Sertifikat va sovg'alar."
                },
                {
                  locale: "RU",
                  title: item.title,
                  subtitle: item.subtitle,
                  description: "Olimpiada uchun yangi mavsum.",
                  rules: "Prikhodite s dokumentom.",
                  prizes: "Sertifikaty i nagrady."
                },
                {
                  locale: "EN",
                  title: item.title,
                  subtitle: item.subtitle,
                  description: "New season olympiad.",
                  rules: "Bring your ID.",
                  prizes: "Certificates and awards."
                }
              ]
            }
          }
        });
      }
    }
  }

  const articleSeeds = [
    {
      slug: "welcome-to-bond",
      coverImageUrl: "/uploads/articles/18431263-6e00-458c-b675-aa133bb4859e.jpg",
      title: "Welcome to BOND",
      body: "BOND marketplace is live with new events and opportunities."
    },
    {
      slug: "winter-olympiad-announcement",
      coverImageUrl: "/uploads/51fe60af-8c1e-45f6-b45f-97f47ac962aa.jpg",
      title: "Winter Olympiad Announcement",
      body: "Registration for the winter season is now open."
    },
    {
      slug: "results-weekly-update",
      coverImageUrl: "/uploads/f1a7c26b-6fea-4f4e-8c90-d3067812824d.jpg",
      title: "Results Update",
      body: "Check the latest announcements and upcoming schedules."
    }
  ];

  for (const article of articleSeeds) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: { status: "PUBLISHED", coverImageUrl: article.coverImageUrl },
      create: {
        slug: article.slug,
        status: "PUBLISHED",
        coverImageUrl: article.coverImageUrl,
        translations: {
          create: [
            { locale: "UZ", title: article.title, body: article.body },
            { locale: "RU", title: article.title, body: article.body },
            { locale: "EN", title: article.title, body: article.body }
          ]
        }
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
