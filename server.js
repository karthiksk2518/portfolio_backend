require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Define Schema and Model
const contactSchema = new mongoose.Schema({
    name: String,
    contactNumber: String,
    email: String,
    message: String,
});

const Contact = mongoose.model("Contact", contactSchema);

// API Routes
app.post("/api/contact", async (req, res) => {
    const { name, contactNumber, email, message } = req.body;

    // Save data to MongoDB
    const contact = new Contact({ name, contactNumber, email, message });
    try {
        await contact.save();

        // Send Email to User
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Thank you for contacting us, ${name}!`,
            text: `Dear ${name},\n\nThank you for reaching out! We have received your message and will get back to you shortly.\n\nHere are the details you provided:\nName: ${name}\nContact Number: ${contactNumber}\nEmail: ${email}\nMessage: ${message}\n\nBest regards,\nKundan Patidar`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send({ message: "Message sent successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred while sending the message." });
    }
});

app.get("/", (req,res) => {
    res.send("API Working");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
