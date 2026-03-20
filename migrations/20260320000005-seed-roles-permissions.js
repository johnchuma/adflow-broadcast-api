"use strict";
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create roles
    const adminRoleId = uuidv4();
    const managerRoleId = uuidv4();
    const userRoleId = uuidv4();

    await queryInterface.bulkInsert("Roles", [
      {
        id: adminRoleId,
        name: "admin",
        description: "Full system access with user management capabilities",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: managerRoleId,
        name: "manager",
        description: "Can manage contacts, messages, and view feedback",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: userRoleId,
        name: "user",
        description: "Basic user with read-only access",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Create permissions
    const permissions = [
      // User management permissions
      { name: "users:create", resource: "users", action: "create", description: "Create new users" },
      { name: "users:read", resource: "users", action: "read", description: "View users" },
      { name: "users:update", resource: "users", action: "update", description: "Update users" },
      { name: "users:delete", resource: "users", action: "delete", description: "Delete users" },
      
      // Contact permissions
      { name: "contacts:create", resource: "contacts", action: "create", description: "Create contacts" },
      { name: "contacts:read", resource: "contacts", action: "read", description: "View contacts" },
      { name: "contacts:update", resource: "contacts", action: "update", description: "Update contacts" },
      { name: "contacts:delete", resource: "contacts", action: "delete", description: "Delete contacts" },
      
      // Message permissions
      { name: "messages:create", resource: "messages", action: "create", description: "Create messages" },
      { name: "messages:read", resource: "messages", action: "read", description: "View messages" },
      { name: "messages:update", resource: "messages", action: "update", description: "Update messages" },
      { name: "messages:delete", resource: "messages", action: "delete", description: "Delete messages" },
      
      // Feedback permissions
      { name: "feedback:read", resource: "feedback", action: "read", description: "View feedback" },
      { name: "feedback:delete", resource: "feedback", action: "delete", description: "Delete feedback" },
      
      // Invitation permissions
      { name: "invitations:read", resource: "invitations", action: "read", description: "View invitations" },
      { name: "invitations:update", resource: "invitations", action: "update", description: "Update invitations" },
    ];

    const permissionRecords = permissions.map((p) => ({
      id: uuidv4(),
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("Permissions", permissionRecords);

    // Get inserted permission IDs
    const insertedPermissions = await queryInterface.sequelize.query(
      `SELECT id, name FROM Permissions;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const permissionMap = {};
    insertedPermissions.forEach((p) => {
      permissionMap[p.name] = p.id;
    });

    // Assign permissions to roles
    const rolePermissions = [];

    // Admin gets all permissions
    Object.values(permissionMap).forEach((permissionId) => {
      rolePermissions.push({
        id: uuidv4(),
        roleId: adminRoleId,
        permissionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Manager gets most permissions except user management
    const managerPermissions = [
      "contacts:create", "contacts:read", "contacts:update", "contacts:delete",
      "messages:create", "messages:read", "messages:update", "messages:delete",
      "feedback:read", "feedback:delete",
      "invitations:read", "invitations:update",
    ];
    managerPermissions.forEach((permName) => {
      rolePermissions.push({
        id: uuidv4(),
        roleId: managerRoleId,
        permissionId: permissionMap[permName],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // User gets only read permissions
    const userPermissions = [
      "contacts:read", "messages:read", "feedback:read", "invitations:read",
    ];
    userPermissions.forEach((permName) => {
      rolePermissions.push({
        id: uuidv4(),
        roleId: userRoleId,
        permissionId: permissionMap[permName],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await queryInterface.bulkInsert("RolePermissions", rolePermissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("RolePermissions", null, {});
    await queryInterface.bulkDelete("Permissions", null, {});
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
