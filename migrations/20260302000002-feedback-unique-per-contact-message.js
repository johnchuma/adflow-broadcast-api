"use strict";

/**
 * Swap the uniqueness strategy on the Feedbacks table:
 *  - Remove the per-wamid unique index (a contact can reply multiple times
 *    with different wamids; we now keep only the latest reply per broadcast).
 *  - Add a composite unique index on (phone, messageId) so the DB itself
 *    enforces one record per contact per broadcast.
 *    MySQL treats NULL as distinct, so rows with messageId = NULL are still
 *    allowed to coexist (edge-case: reply with no matched broadcast).
 */
module.exports = {
  async up(queryInterface) {
    // Remove the old whatsappMessageId unique constraint
    // (index is named 'whatsappMessageId' as created by the column definition)
    await queryInterface.removeIndex("Feedbacks", "whatsappMessageId");

    // One feedback record per (phone, broadcast message)
    await queryInterface.addIndex("Feedbacks", ["phone", "messageId"], {
      unique: true,
      name: "feedbacks_phone_messageid_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "Feedbacks",
      "feedbacks_phone_messageid_unique",
    );
    await queryInterface.addIndex("Feedbacks", ["whatsappMessageId"], {
      unique: true,
      name: "whatsappMessageId",
    });
  },
};
