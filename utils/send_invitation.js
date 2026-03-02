const axios = require("axios");

/**
 * Sends the "invitation" WhatsApp template (language: sw) to a phone number.
 * The template has an image header (the QR code) and no body variables.
 *
 * @param {string} phone       - Recipient phone number (e.g. "255627707434")
 * @param {string} qrCodeFile  - QR code filename stored in /files (e.g. "abc123.png")
 */
const sendInvitation = async (phone, qrCodeFile) => {
  const imageUrl = `https://adflowbroadcastapi.adflow.africa/files/${qrCodeFile}`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone,
    type: "template",
    template: {
      name: "invitation",
      language: { code: "sw" },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: { link: imageUrl },
            },
          ],
        },
      ],
    },
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.ADFLOW_WHATSAPP_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
      },
    );
    console.log(`Invitation sent to ${phone}:`, response.data);
    return response.data;
  } catch (err) {
    console.error(
      `Error sending invitation to ${phone}:`,
      err.response?.data || err.message,
    );
    return null;
  }
};

module.exports = { sendInvitation };
