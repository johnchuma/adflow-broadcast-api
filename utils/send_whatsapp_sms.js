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
        name: "mualiko_wa_semina",
        language: {
          code: "sw",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: safeName,
              },
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
