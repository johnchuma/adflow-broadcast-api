const { default: axios } = require("axios");
const { config } = require("dotenv");
const { type } = require("express/lib/response");

const sendWhatsappSMS = async ({ name, phone }) => {
  try {
    const safeName =
      typeof name === "string" && name.trim().length > 0
        ? name.trim()
        : "mteja";

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone,
      type: "template",
      template: {
        // Must match the exact template name in WhatsApp Business Manager
        name: "creator_seminar",
        language: {
          code: "en",
        },
        components: [
          // Header image component – required because the template has an image header
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  // Use env var so you can change without code deploy
                  link: "https://performanceapi.adflow.africa/uploads/ministry.png",
                },
              },
            ],
          },
          // Body with one text variable {{1}}
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: safeName,
              },
            ],
          },
          // Your quick-reply buttons are static, so no button component is needed
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
