const { Router } = require("express");
const {
  createUser,
  getUsers,
  editUser,
  deleteUser,
  loginUser,
  getLoggedInUser,
} = require("./users.controllers");
const { getPagination } = require("../../utils/getPagination");
const { validateJWT } = require("../../utils/validateJWT");
const router = Router();
router.post("/", createUser);
router.post("/auth/login", loginUser);
router.get("/", getPagination, getUsers);
router.get("/me", validateJWT, getLoggedInUser);
router.patch("/:id", editUser);
router.delete("/:id", deleteUser);

module.exports = router;
