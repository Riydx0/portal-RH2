import { scryptSync, randomBytes } from "crypto";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function createAdmin() {
  const email = "admin@test.com";
  const password = "Admin@12345";
  const name = "Test Admin";

  // Hash password
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  const hashedPassword = salt.toString("hex") + ":" + hash.toString("hex");

  try {
    const result = await sql`
      INSERT INTO users (name, email, password, role) 
      VALUES (${name}, ${email}, ${hashedPassword}, 'admin')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
      RETURNING id, email, name, role
    `;

    console.log("✅ Admin Account Created/Updated");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("");
    console.log("استخدم هذه البيانات للدخول كـ Admin");
  } catch (error: any) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

createAdmin();
