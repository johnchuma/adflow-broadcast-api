const { Router } = require("express");
const { getFeedbacks, getFeedbackStats } = require("./feedbacks.controllers");
const { getPagination } = require("../../utils/getPagination");

const router = Router();

router.get("/", getPagination, getFeedbacks);
router.get("/stats", getFeedbackStats);

module.exports = router;
