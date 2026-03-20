const { User, Role } = require("./models");

async function checkAdminUser() {
  try {
    const adminUser = await User.findOne({
      where: { email: "admin@adflow.com" },
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    if (!adminUser) {
      console.log("❌ Admin user not found");
      process.exit(1);
    }

    console.log("✅ Admin user found:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", adminUser.email);
    console.log("👤 Name:", adminUser.name);
    console.log("🆔 ID:", adminUser.id);
    console.log("🔐 Role ID:", adminUser.roleId);
    console.log("✅ Active:", adminUser.isActive);

    if (adminUser.role) {
      console.log("👑 Role Name:", adminUser.role.name);
      console.log("📝 Role Description:", adminUser.role.description);
    } else {
      console.log("⚠️  WARNING: No role assigned!");
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkAdminUser();
