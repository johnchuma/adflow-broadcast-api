const { Router } = require("express");
const {
  createMessage,
  getMessages,
  editMessage,
  deleteMessage,
} = require("./messages.controllers");
const { getPagination } = require("../../utils/getPagination");
const router = Router();
router.post("/", createMessage);
router.get("/", getPagination, getMessages);
router.patch("/:id", editMessage);
router.delete("/:id", deleteMessage);

module.exports = router;
