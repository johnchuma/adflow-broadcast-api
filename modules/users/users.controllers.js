const { Op } = require("sequelize");
const { User } = require("../../models");
const { generateJwtTokens } = require("../../utils/generateJwtTokens");
const bcrypt = require("bcrypt");
const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //encrypt passsowrd

    const encryptedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      email,
      password: encryptedPassword,
    });
    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while creating the user",
      error: error.message,
    });
  }
};

//login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }
    const token = generateJwtTokens(); // Assuming you have a method to generate a token
    // Generate a token or session here if needed
    return res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while logging in",
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAndCountAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${req.query.keyword || ""}%`,
            },
          },
          {
            location: {
              [Op.like]: `%${req.query.keyword || ""}%`,
            },
          },
        ],
      },
      limit: req.limit, // Limit the number of results
      offset: req.offset, // Offset for pagination
      order: [["name", "DESC"]], // Order by createdAt in descending order
    });

    return res.status(200).json({
      message: "Users retrieved successfully",
      users: users.rows,
      total: users.count,
      page: req.page,
      limit: req.limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while retrieving users",
      error: error.message,
    });
  }
};

//edit
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findByPk(id);
    user = await user.update(req.body);

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the user",
      error: error.message,
    });
  }
};

//delete
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findByPk(id);
    await user.delete();

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the user",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  editUser,
  deleteUser,
  loginUser,
};
