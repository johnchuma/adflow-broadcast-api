const { Router } = require("express");
const {
  createUser,
  getUsers,
  editUser,
  deleteUser,
  loginUser,
} = require("./users.controllers");
const { getPagination } = require("../../utils/getPagination");
const router = Router();
router.post("/", createUser);
router.post("/auth/login", loginUser);
router.get("/", getPagination, getUsers);
router.patch("/:id", editUser);
router.delete("/:id", deleteUser);

module.exports = router;
