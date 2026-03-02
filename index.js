const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const contactsRoutes = require("./modules/contacts/contacts.routes");
const usersRoutes = require("./modules/users/users.routes");
const messagesRoutes = require("./modules/messages/messages.routes");
const feedbacksRoutes = require("./modules/feedbacks/feedbacks.routes");

app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);
app.use("/messages", messagesRoutes);
app.use("/feedbacks", feedbacksRoutes);

// ─── Sentiment helper ──────────────────────────────────────────────────────
const POSITIVE_KEYWORDS = [
  "asante",
  "nitahudhuria",
  "attend",
  "yes",
  "ndiyo",
  "sawa",
  "nakuja",
  "positive",
];
const NEGATIVE_KEYWORDS = [
  "samahani",
  "sitahudhuria",
  "sihudhuria",
  "hapana",
  "no",
  "pole",
  "siwezi",
  "negative",
];

function detectSentiment(text = "") {
  const lower = text.toLowerCase();
  if (NEGATIVE_KEYWORDS.some((k) => lower.includes(k))) return "negative";
  if (POSITIVE_KEYWORDS.some((k) => lower.includes(k))) return "positive";
  return "neutral";
}

// WhatsApp Cloud API webhook verification (GET) and event receiver (POST)
app.get("/webhook", (req, res) => {
  const verifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN || "adflow-verify-token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified successfully");
    return res.status(200).send(challenge);
  }

  console.warn("Invalid WhatsApp webhook verification attempt", {
    mode,
    token,
  });
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  // Always respond quickly with 200 so WhatsApp treats the delivery as successful
  res.sendStatus(200);

  try {
    console.log(
      "Incoming WhatsApp webhook event:",
      JSON.stringify(req.body, null, 2),
    );

    const { Contact, Message, Feedback } = require("./models");

    const entries = req.body?.entry || [];
    for (const entry of entries) {
      for (const change of entry?.changes || []) {
        const value = change?.value;
        if (!value || change.field !== "messages") continue;

        const incomingMessages = value.messages || [];
        const waContacts = value.contacts || [];

        for (const msg of incomingMessages) {
          // Only handle button replies or plain text responses
          const msgType = msg.type;
          const replyText =
            msgType === "button"
              ? msg.button?.text || msg.button?.payload || ""
              : msgType === "text"
                ? msg.text?.body || ""
                : null;

          if (!replyText) continue;

          const fromPhone = msg.from; // e.g. "255627707434"
          const wamid = msg.id;
          const timestamp = msg.timestamp
            ? new Date(parseInt(msg.timestamp) * 1000)
            : new Date();

          // Profile name from the contacts array in the webhook payload
          const waProfile = waContacts.find((c) => c.wa_id === fromPhone);
          const contactName = waProfile?.profile?.name || null;

          const sentiment = detectSentiment(replyText);

          // Find matching contact in our DB by phone (strip any leading +)
          const normalizedPhone = fromPhone.replace(/^\+/, "");
          const contact = await Contact.findOne({
            where: { phone: normalizedPhone },
          });

          // Link to the most recent broadcast message
          const latestMessage = await Message.findOne({
            order: [["createdAt", "DESC"]],
          });

          // Upsert: skip if we already processed this WhatsApp message id
          await Feedback.findOrCreate({
            where: { whatsappMessageId: wamid },
            defaults: {
              contactId: contact?.id || null,
              messageId: latestMessage?.id || null,
              phone: normalizedPhone,
              contactName: contact?.name || contactName,
              text: replyText,
              sentiment,
              respondedAt: timestamp,
            },
          });

          console.log(
            `Feedback saved: ${replyText} (${sentiment}) from ${fromPhone}`,
          );
        }
      }
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Adflow Broadcast API");
});
app.listen(4005, () => {
  console.log("Server is running on port 4005");
});
