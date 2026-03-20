const express = require("express");
const path = require("path");
const QRCode = require("qrcode");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Serve generated QR code images
app.use("/files", express.static(path.join(__dirname, "files")));

const contactsRoutes = require("./modules/contacts/contacts.routes");
const usersRoutes = require("./modules/users/users.routes");
const messagesRoutes = require("./modules/messages/messages.routes");
const feedbacksRoutes = require("./modules/feedbacks/feedbacks.routes");
const invitationsRoutes = require("./modules/invitations/invitations.routes");
const { sendInvitation } = require("./utils/send_invitation");

app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);
app.use("/messages", messagesRoutes);
app.use("/feedbacks", feedbacksRoutes);
app.use("/invitations", invitationsRoutes);

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

          // ─── Filter: Only accept specific feedback responses ──────────────
          const validResponses = [
            "Asante, Nitahudhuria",
            "Samahani, Sitahudhuria",
          ];
          const normalizedReply = replyText.trim();

          if (!validResponses.includes(normalizedReply)) {
            console.log(
              `Filtered out invalid feedback response: "${replyText}" from ${msg.from}`,
            );
            continue; // Skip this message, don't record to database
          }

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

          // Upsert: one record per (phone + broadcast message).
          // If the same contact replies again to the same broadcast, update
          // the existing record with the latest reply instead of creating a new one.
          const lookupWhere = latestMessage?.id
            ? { phone: normalizedPhone, messageId: latestMessage.id }
            : { whatsappMessageId: wamid };

          const existing = await Feedback.findOne({ where: lookupWhere });

          const { Invitation } = require("./models");

          if (existing) {
            await existing.update({
              text: replyText,
              sentiment,
              whatsappMessageId: wamid,
              contactId: contact?.id || existing.contactId,
              contactName: contact?.name || contactName || existing.contactName,
              respondedAt: timestamp,
            });
            console.log(
              `Feedback updated: ${replyText} (${sentiment}) from ${fromPhone}`,
            );

            // ── Send invitation if reply just turned positive and no invitation sent yet ──
            if (sentiment === "positive") {
              const alreadyInvited = await Invitation.findOne({
                where: { feedbackId: existing.id },
              });
              if (!alreadyInvited) {
                try {
                  const qrCodeFile = `${normalizedPhone}-${Date.now()}.png`;
                  const qrCodePath = path.join(__dirname, "files", qrCodeFile);
                  await QRCode.toFile(qrCodePath, normalizedPhone, {
                    width: 400,
                    margin: 2,
                  });
                  await sendInvitation(normalizedPhone, qrCodeFile);
                  await Invitation.create({
                    contactId: contact?.id || existing.contactId,
                    messageId: latestMessage?.id || null,
                    feedbackId: existing.id,
                    phone: normalizedPhone,
                    contactName:
                      contact?.name || contactName || existing.contactName,
                    qrCodeFile,
                    checkedIn: false,
                  });
                  console.log(
                    `Invitation sent for updated positive feedback from ${fromPhone}`,
                  );
                } catch (invErr) {
                  console.error(
                    `Error sending invitation to ${fromPhone}:`,
                    invErr,
                  );
                }
              }
            }
          } else {
            const feedback = await Feedback.create({
              contactId: contact?.id || null,
              messageId: latestMessage?.id || null,
              phone: normalizedPhone,
              contactName: contact?.name || contactName,
              text: replyText,
              sentiment,
              whatsappMessageId: wamid,
              respondedAt: timestamp,
            });
            console.log(
              `Feedback saved: ${replyText} (${sentiment}) from ${fromPhone}`,
            );

            // ── Send invitation QR code for positive replies ──────────────
            if (sentiment === "positive") {
              try {
                // Generate a unique QR code encoding the contact's phone
                const qrCodeFile = `${normalizedPhone}-${Date.now()}.png`;
                const qrCodePath = path.join(__dirname, "files", qrCodeFile);
                await QRCode.toFile(qrCodePath, normalizedPhone, {
                  width: 400,
                  margin: 2,
                });

                // Send the invitation WhatsApp template with the QR image
                await sendInvitation(normalizedPhone, qrCodeFile);

                // Record the invitation
                await Invitation.create({
                  contactId: contact?.id || null,
                  messageId: latestMessage?.id || null,
                  feedbackId: feedback.id,
                  phone: normalizedPhone,
                  contactName: contact?.name || contactName,
                  qrCodeFile,
                  checkedIn: false,
                });

                console.log(
                  `Invitation sent and recorded for ${fromPhone} (QR: ${qrCodeFile})`,
                );
              } catch (invErr) {
                console.error(
                  `Error sending invitation to ${fromPhone}:`,
                  invErr,
                );
              }
            }
          }
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
