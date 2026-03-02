const { default: axios } = require("axios");
const { config } = require("dotenv");
const { type } = require("express/lib/response");

const sendWhatsappSMS = async ({ content, name, location, phone, imageUrl }) => {
  try {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        name: "mualiko_wa_semina",
        language: {
          code: "sw",
        },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: imageUrl || process.env.DEFAULT_WHATSAPP_IMAGE_URL || "https://via.placeholder.com/600x400/0066cc/ffffff?text=AdFlow+News"
                }
              }
            ]
          },
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: name,
              }
            ],
          },
        ],
      },
    };
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.ADFLOW_WHATSAPP_NUMBER_ID}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
      },
    );
    console.log("WhatsApp message sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error.response.data);
    return error.response.data;
  }
};

module.exports = { sendWhatsappSMS };
