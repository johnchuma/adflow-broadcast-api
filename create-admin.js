const bcrypt = require("bcrypt");
const { User, Role } = require("./models");

async function createAdminUser() {
  try {
    // Find admin role
    const adminRole = await Role.findOne({ where: { name: "admin" } });

    if (!adminRole) {
      console.error("❌ Admin role not found. Please run migrations first.");
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@adflow.com" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists.");
      console.log("Email: admin@adflow.com");
      return;
    }

    // Create admin user
    const password = "admin123"; // Default password
    const encryptedPassword = bcrypt.hashSync(password, 10);

    await User.create({
      email: "admin@adflow.com",
      name: "Administrator",
      password: encryptedPassword,
      roleId: adminRole.id,
      isActive: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email: admin@adflow.com");
    console.log("🔑 Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  Please change this password after first login!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdminUser();
