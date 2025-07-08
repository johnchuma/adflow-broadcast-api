const { Op } = require("sequelize");
const { Contact } = require("../../models");
const addPrefixToPhoneNumber = require("../../utils/add_number_prefix");
const createContact = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const contact = await Contact.create({
      name,
      phone,
      location,
    });
    return res.status(201).json({
      message: "Contact created successfully",
      contact,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while creating the contact",
      error: error.message,
    });
  }
};
const createBulkContacts = async (req, res) => {
  try {
    const { contacts } = req.body;
    //convert string array to object array
    const contactObjects = contacts.map((contact) => ({
      name: contact.name,
      phone: addPrefixToPhoneNumber(contact.phone),
      location: contact.location,
    }));
    const createdContacts = await Contact.bulkCreate(contactObjects);

    return res.status(201).json({
      message: "Contact created successfully",
      createdContacts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while creating the contact",
      error: error.message,
    });
  }
};
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAndCountAll({
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
      message: "Contacts retrieved successfully",
      contacts: contacts.rows,
      total: contacts.count,
      page: req.page,
      limit: req.limit,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while retrieving contacts",
      error: error.message,
    });
  }
};

//edit
const editContact = async (req, res) => {
  try {
    const { id } = req.params;
    let contact = await Contact.findByPk(id);
    contact = await contact.update(req.body);

    return res.status(200).json({
      message: "Contact updated successfully",
      contact,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the contact",
      error: error.message,
    });
  }
};

//delete
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    let contact = await Contact.findByPk(id);
    await contact.delete();

    return res.status(200).json({
      message: "Contact deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while updating the contact",
      error: error.message,
    });
  }
};

module.exports = {
  createContact,
  getContacts,
  editContact,
  deleteContact,
  createBulkContacts,
};
