const { Invitation, Contact, Message } = require("../../models");

async function getInvitations(req, res) {
  try {
    const { limit, offset, page } = req;
    const { checkedIn } = req.query;

    const where = {};
    if (checkedIn === "true") where.checkedIn = true;
    if (checkedIn === "false") where.checkedIn = false;

    const { count, rows } = await Invitation.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "phone", "location"],
        },
        {
          model: Message,
          as: "message",
          attributes: ["id", "content", "createdAt"],
        },
      ],
    });

    return res.json({
      invitations: rows,
      total: count,
      page,
      limit,
    });
  } catch (err) {
    console.error("getInvitations error:", err);
    return res.status(500).json({ message: "Failed to fetch invitations" });
  }
}

async function checkIn(req, res) {
  try {
    const { id } = req.params;
    const invitation = await Invitation.findByPk(id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }
    await invitation.update({
      checkedIn: true,
      checkedInAt: new Date(),
    });
    return res.json({ invitation });
  } catch (err) {
    console.error("checkIn error:", err);
    return res.status(500).json({ message: "Failed to check in" });
  }
}

async function getInvitationStats(req, res) {
  try {
    const [total, checkedIn] = await Promise.all([
      Invitation.count(),
      Invitation.count({ where: { checkedIn: true } }),
    ]);
    return res.json({
      stats: { total, checkedIn, notCheckedIn: total - checkedIn },
    });
  } catch (err) {
    console.error("getInvitationStats error:", err);
    return res.status(500).json({ message: "Failed to fetch stats" });
  }
}

module.exports = { getInvitations, checkIn, getInvitationStats };
