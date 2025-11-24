import { scryptSync, randomBytes } from "crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function fixAdminPassword() {
  const password = "Admin@12345";
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64);
  const hashedPassword = `${hash.toString("hex")}.${salt}`;

  try {
    const result = await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE email = 'admin@test.com'
      RETURNING id, email, name, role
    `;

    console.log("✅ Admin Password Fixed!");
    console.log("📧 Email:", result[0]?.email);
    console.log("🔑 Password: Admin@12345");
  } catch (error: any) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

fixAdminPassword();
