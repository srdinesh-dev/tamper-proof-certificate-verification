const dns = require("dns");

dns.setServers(["1.1.1.1"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "Tamper-Proof Certificate Verification API is running",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});