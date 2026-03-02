const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const contactsRoutes = require("./modules/contacts/contacts.routes");
const usersRoutes = require("./modules/users/users.routes");
const messagesRoutes = require("./modules/messages/messages.routes");

app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);
app.use("/messages", messagesRoutes);

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

app.post("/webhook", (req, res) => {
  console.log(
    "Incoming WhatsApp webhook event:",
    JSON.stringify(req.body, null, 2),
  );

  // Always respond quickly with 200 so WhatsApp treats the delivery as successful
  return res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Welcome to the Adflow Broadcast API");
});
app.listen(4005, () => {
  console.log("Server is running on port 4005");
});
