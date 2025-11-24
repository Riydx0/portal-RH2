import { db } from "./db";
import { users, categories, software, licenses, tickets, ticketComments } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    console.log("Creating admin user...");
    const [admin] = await db
      .insert(users)
      .values({
        name: "Admin User",
        email: "admin@example.com",
        password: await hashPassword("Admin123!"),
        role: "admin",
      })
      .returning();

    console.log("Creating tech user...");
    const [tech] = await db
      .insert(users)
      .values({
        name: "Tech Support",
        email: "tech@example.com",
        password: await hashPassword("Tech123!"),
        role: "tech",
      })
      .returning();

    console.log("Creating client user...");
    const [client] = await db
      .insert(users)
      .values({
        name: "John Doe",
        email: "client@example.com",
        password: await hashPassword("Client123!"),
        role: "client",
      })
      .returning();

    console.log("Creating categories...");
    const [officeCategory] = await db
      .insert(categories)
      .values({
        name: "Office",
        description: "Office productivity software",
      })
      .returning();

    const [securityCategory] = await db
      .insert(categories)
      .values({
        name: "Security",
        description: "Antivirus and security software",
      })
      .returning();

    const [browsersCategory] = await db
      .insert(categories)
      .values({
        name: "Browsers",
        description: "Web browsers",
      })
      .returning();

    const [utilitiesCategory] = await db
      .insert(categories)
      .values({
        name: "Utilities",
        description: "System utilities and tools",
      })
      .returning();

    console.log("Creating software...");
    const [office365] = await db
      .insert(software)
      .values({
        name: "Microsoft Office 365",
        categoryId: officeCategory.id,
        description: "Complete office suite with Word, Excel, PowerPoint, and more",
        downloadUrl: "https://www.microsoft.com/microsoft-365/download-office",
        version: "2024",
        platform: "Both",
        isActive: true,
      })
      .returning();

    const [kaspersky] = await db
      .insert(software)
      .values({
        name: "Kaspersky Internet Security",
        categoryId: securityCategory.id,
        description: "Advanced antivirus and internet security protection",
        downloadUrl: "https://www.kaspersky.com/downloads",
        version: "2024",
        platform: "Both",
        isActive: true,
      })
      .returning();

    const [chrome] = await db
      .insert(software)
      .values({
        name: "Google Chrome",
        categoryId: browsersCategory.id,
        description: "Fast and secure web browser from Google",
        downloadUrl: "https://www.google.com/chrome/",
        version: "Latest",
        platform: "Both",
        isActive: true,
      })
      .returning();

    await db.insert(software).values({
      name: "WinRAR",
      categoryId: utilitiesCategory.id,
      description: "File compression and extraction tool",
      downloadUrl: "https://www.win-rar.com/download.html",
      version: "6.24",
      platform: "Windows",
      isActive: true,
    });

    await db.insert(software).values({
      name: "Adobe Acrobat Reader",
      categoryId: officeCategory.id,
      description: "PDF reader and viewer",
      downloadUrl: "https://get.adobe.com/reader/",
      version: "Latest",
      platform: "Both",
      isActive: true,
    });

    console.log("Creating licenses...");
    await db.insert(licenses).values({
      softwareId: office365.id,
      licenseKey: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
      assignedTo: "John Doe",
      status: "in-use",
      notes: "Company license - expires Dec 2025",
    });

    await db.insert(licenses).values({
      softwareId: office365.id,
      licenseKey: "YYYYY-YYYYY-YYYYY-YYYYY-YYYYY",
      assignedTo: null,
      status: "available",
      notes: "Available for new users",
    });

    await db.insert(licenses).values({
      softwareId: kaspersky.id,
      licenseKey: "AAAAA-BBBBB-CCCCC-DDDDD-EEEEE",
      assignedTo: "IT Department",
      status: "in-use",
      notes: "Enterprise license - 50 seats",
    });

    await db.insert(licenses).values({
      softwareId: kaspersky.id,
      licenseKey: "FFFFF-GGGGG-HHHHH-IIIII-JJJJJ",
      assignedTo: null,
      status: "expired",
      notes: "Expired on 01/2024",
    });

    console.log("Creating tickets...");
    const [ticket1] = await db
      .insert(tickets)
      .values({
        title: "Cannot install Microsoft Office",
        description:
          "I'm getting an error when trying to install Office 365 on my computer. The error message says 'Installation failed - error code 0x80070643'. I've tried restarting my computer but the issue persists.",
        status: "open",
        priority: "high",
        createdBy: client.id,
        assignedTo: tech.id,
      })
      .returning();

    const [ticket2] = await db
      .insert(tickets)
      .values({
        title: "Need license key for new employee",
        description:
          "We have a new employee starting next week and need an Office 365 license key. Please provide an available license.",
        status: "in-progress",
        priority: "normal",
        createdBy: client.id,
        assignedTo: admin.id,
      })
      .returning();

    await db.insert(tickets).values({
      title: "Kaspersky not updating",
      description:
        "My Kaspersky antivirus hasn't been updating for the past 3 days. How can I fix this?",
      status: "closed",
      priority: "normal",
      createdBy: client.id,
      assignedTo: tech.id,
    });

    console.log("Creating ticket comments...");
    await db.insert(ticketComments).values({
      ticketId: ticket1.id,
      userId: tech.id,
      comment:
        "I've checked the error code. This usually happens when there's a conflict with Windows Update. Can you try running Windows Update first and then retry the installation?",
    });

    await db.insert(ticketComments).values({
      ticketId: ticket2.id,
      userId: admin.id,
      comment:
        "I've assigned license key YYYYY-YYYYY-YYYYY-YYYYY-YYYYY to the new employee. Please confirm when they're onboarded.",
    });

    console.log("✅ Database seeding completed successfully!");
    console.log("\nDefault users created:");
    console.log("  Admin: admin@example.com / Admin123!");
    console.log("  Tech: tech@example.com / Tech123!");
    console.log("  Client: client@example.com / Client123!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Seeding done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
