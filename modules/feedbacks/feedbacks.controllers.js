const { Feedback, Contact, Message } = require("../../models");
const { getPagination } = require("../../utils/getPagination");

const getFeedbacks = async (req, res) => {
  try {
    const { sentiment } = req.query;
    const where = {};
    if (sentiment && ["positive", "negative", "neutral"].includes(sentiment)) {
      where.sentiment = sentiment;
    }

    const feedbacks = await Feedback.findAndCountAll({
      where,
      order: [["respondedAt", "DESC"]],
      limit: req.limit,
      offset: req.offset,
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "phone", "location"],
          required: false,
        },
        {
          model: Message,
          as: "message",
          attributes: ["id", "content", "recipientsCount", "createdAt"],
          required: false,
        },
      ],
    });

    return res.status(200).json({
      message: "Feedbacks retrieved successfully",
      feedbacks: feedbacks.rows,
      total: feedbacks.count,
      page: req.page,
      limit: req.limit,
    });
  } catch (error) {
    console.error("Error retrieving feedbacks:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving feedbacks",
      error: error.message,
    });
  }
};

const getFeedbackStats = async (req, res) => {
  try {
    const [total, positive, negative, neutral] = await Promise.all([
      Feedback.count(),
      Feedback.count({ where: { sentiment: "positive" } }),
      Feedback.count({ where: { sentiment: "negative" } }),
      Feedback.count({ where: { sentiment: "neutral" } }),
    ]);

    return res.status(200).json({
      message: "Feedback stats retrieved successfully",
      stats: { total, positive, negative, neutral },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while retrieving feedback stats",
      error: error.message,
    });
  }
};

module.exports = { getFeedbacks, getFeedbackStats };
