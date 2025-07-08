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

app.get("/", (req, res) => {
  res.send("Welcome to the Adflow Broadcast API");
});
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
