const { Router } = require("express");
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getPermissions,
  getUserStats,
} = require("./admin.controllers");
const { getPagination } = require("../../utils/getPagination");
const { validateJWT } = require("../../utils/validateJWT");
const { requireRole, checkPermission } = require("../../utils/authorization");

const router = Router();

// All admin routes require authentication
router.use(validateJWT);

// User management routes (admin only)
router.get("/users", requireRole("admin"), getPagination, getAllUsers);
router.post("/users", requireRole("admin"), createUser);
router.patch("/users/:id", requireRole("admin"), updateUser);
router.delete("/users/:id", requireRole("admin"), deleteUser);
router.get("/users/stats", requireRole("admin"), getUserStats);

// Role and permission routes
router.get("/roles", requireRole("admin", "manager"), getRoles);
router.get("/permissions", requireRole("admin"), getPermissions);

module.exports = router;
