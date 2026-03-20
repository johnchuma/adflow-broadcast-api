const { User, Role, Permission } = require("../models");

/**
 * Middleware to check if user has a specific permission
 * Usage: checkPermission('users:create')
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized - User not authenticated",
        });
      }

      // Fetch user with role and permissions
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: "role",
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          status: false,
          message: "Your account has been deactivated",
        });
      }

      if (!user.role) {
        return res.status(403).json({
          status: false,
          message: "No role assigned to user",
        });
      }

      // Check if user has the required permission
      const hasPermission = user.role.permissions.some(
        (permission) => permission.name === requiredPermission,
      );

      if (!hasPermission) {
        return res.status(403).json({
          status: false,
          message: `Insufficient permissions - requires ${requiredPermission}`,
        });
      }

      // Attach user data to request for use in controllers
      req.userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        permissions: user.role.permissions.map((p) => p.name),
      };

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        status: false,
        message: "Error checking permissions",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware to check if user has a specific role
 * Usage: requireRole('admin')
 */
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized - User not authenticated",
        });
      }

      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: "role",
          },
        ],
      });

      if (!user) {
        return res.status(401).json({
          status: false,
          message: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          status: false,
          message: "Your account has been deactivated",
        });
      }

      if (!user.role) {
        return res.status(403).json({
          status: false,
          message: "No role assigned to user",
        });
      }

      if (!allowedRoles.includes(user.role.name)) {
        return res.status(403).json({
          status: false,
          message: `Access denied - requires one of: ${allowedRoles.join(", ")}`,
        });
      }

      req.userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      };

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        status: false,
        message: "Error checking role",
        error: error.message,
      });
    }
  };
};

module.exports = { checkPermission, requireRole };
