require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
});

const db = mongoose.connection;
db.once("open", () => console.log("Banco de dados conectado!"));
db.on("error", (err) => console.error("Erro no banco de dados:", err));
