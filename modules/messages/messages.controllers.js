const { Op } = require("sequelize");
const { Message } = require("../../models");
const { sendWhatsappSMS } = require("../../utils/send_whatsapp_sms");
const addPrefixToPhoneNumber = require("../../utils/add_number_prefix");
const createMessage = async (req, res) => {
  try {
    const { content, contacts } = req.body;

    //create object array from contacts
    const contactObjects = contacts.map((contact) => ({
      name: contact.name,
      phone: addPrefixToPhoneNumber(contact.phone),
      location: contact.location,
    }));

    const message = await Message.create({
      content,
      recipientsCount: contactObjects.length,
    });

    await Promise.all(
      contactObjects.map((contact) => {
        return sendWhatsappSMS({
          content,
          name: contact.name,
          location: contact.location,
          phone: contact.phone,
        });
      })
    );
    return res.status(201).json({
      message: "Message created successfully",
      message,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while creating the message",
      error: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.findAndCountAll({
      where: {
        [Op.or]: [
          {
            content: {
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
      message: "Messages retrieved successfully",
      messages: messages.rows,
      total: messages.count,
      page: req.page,
      limit: req.limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while retrieving messages",
      error: error.message,
    });
  }
};

//edit
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    let message = await Message.findByPk(id);
    message = await message.update(req.body);

    return res.status(200).json({
      message: "Message updated successfully",
      message,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the message",
      error: error.message,
    });
  }
};

//delete
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    let message = await Message.findByPk(id);
    await message.delete();

    return res.status(200).json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the message",
      error: error.message,
    });
  }
};

module.exports = {
  createMessage,
  getMessages,
  editMessage,
  deleteMessage,
};
