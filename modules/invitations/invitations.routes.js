const { Router } = require("express");
const { getInvitations, checkIn, getInvitationStats } = require("./invitations.controllers");
const { getPagination } = require("../../utils/getPagination");

const router = Router();

router.get("/", getPagination, getInvitations);
router.get("/stats", getInvitationStats);
router.patch("/:id/check-in", checkIn);

module.exports = router;
