const { Router } = require("express");
const {
  createContact,
  getContacts,
  editContact,
  deleteContact,
  createBulkContact,
  createBulkContacts,
} = require("./contacts.controllers");
const { getPagination } = require("../../utils/getPagination");
const router = Router();
router.post("/", createContact);
router.post("/bulk", createBulkContacts);
router.get("/", getPagination, getContacts);
router.patch("/:id", editContact);
router.delete("/:id", deleteContact);

module.exports = router;
