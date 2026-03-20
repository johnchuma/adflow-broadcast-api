const { User, Role, Permission } = require("../../models");
const { getPagination } = require("../../utils/getPagination");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { keyword = "", role = "" } = req.query;
    const where = {
      [Op.and]: [],
    };

    if (keyword) {
      where[Op.and].push({
        [Op.or]: [
          { email: { [Op.like]: `%${keyword}%` } },
          { name: { [Op.like]: `%${keyword}%` } },
        ],
      });
    }

    const users = await User.findAndCountAll({
      where,
      limit: req.limit,
      offset: req.offset,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
          where: role ? { name: role } : undefined,
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

    return res.status(200).json({
      message: "Users retrieved successfully",
      users: users.rows,
      total: users.count,
      page: req.page,
      limit: req.limit,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving users",
      error: error.message,
    });
  }
};

// Create a new user (admin only)
const createUser = async (req, res) => {
  try {
    const { email, password, name, roleId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Validate role if provided
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({
          message: "Invalid role ID",
        });
      }
    }

    const encryptedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      email,
      password: encryptedPassword,
      name,
      roleId,
      isActive: true,
    });

    // Fetch user with role info
    const createdUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    return res.status(201).json({
      message: "User created successfully",
      user: createdUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "An error occurred while creating the user",
      error: error.message,
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, roleId, isActive, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Validate role if provided
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) {
        return res.status(400).json({
          message: "Invalid role ID",
        });
      }
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
    }

    await user.update(updateData);

    // Fetch updated user with role info
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      message: "An error occurred while updating the user",
      error: error.message,
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
};

// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: "permissions",
          through: { attributes: [] },
        },
      ],
    });

    return res.status(200).json({
      message: "Roles retrieved successfully",
      roles,
    });
  } catch (error) {
    console.error("Error retrieving roles:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving roles",
      error: error.message,
    });
  }
};

// Get all permissions
const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [
        ["resource", "ASC"],
        ["action", "ASC"],
      ],
    });

    return res.status(200).json({
      message: "Permissions retrieved successfully",
      permissions,
    });
  } catch (error) {
    console.error("Error retrieving permissions:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving permissions",
      error: error.message,
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    const usersByRole = await User.findAll({
      attributes: [
        [User.sequelize.fn("COUNT", User.sequelize.col("User.id")), "count"],
      ],
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
      group: ["role.id", "role.name"],
      raw: true,
    });

    return res.status(200).json({
      message: "User statistics retrieved successfully",
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole,
      },
    });
  } catch (error) {
    console.error("Error retrieving user stats:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving user statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getPermissions,
  getUserStats,
};
