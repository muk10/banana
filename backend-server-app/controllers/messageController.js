const Message = require("../models/Message")
const mongoose = require("mongoose");

const getMessage = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({message: "Database not connected. Please start MongoDB."});
        }
        const messages = await Message.find().lean();
        const messagesArray = Array.isArray(messages) ? messages : [];
        res.setHeader('Content-Type', 'application/json');
        res.json(messagesArray);
    } catch (err) {
        console.error("Error fetching message:", err);
        res.status(500).json({message: "Error fetching message: " + err.message});
    }
}

const createMessage = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({message: "Database not connected. Please start MongoDB."});
        }
        const messageText = req.body.text || "hello from backend";
        await Message.create({text: messageText});
        res.json({message: messageText});
    } catch (err) {
        console.error("Error creating message:", err);
        res.status(500).json({message: "Error creating message: " + err.message});
    }
}

const updateMessage = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({message: "Database not connected. Please start MongoDB."});
        }
        const { id } = req.params;
        const { text } = req.body;
        const updatedMessage = await Message.findByIdAndUpdate(id, {text}, {new: true});
        if (!updatedMessage) {
            return res.status(404).json({message: "Message not found"});
        }
        res.json({message: updatedMessage.text});
    } catch (err) {
        console.error("Error updating message:", err);
        res.status(500).json({message: "Error updating message: " + err.message});
    }
}

const deleteMessage = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({message: "Database not connected. Please start MongoDB."});
        }
        const { id } = req.params;
        const deletedMessage = await Message.findByIdAndDelete(id);
        if (!deletedMessage) {
            return res.status(404).json({message: "Message not found"});
        }
        res.json({message: "Message deleted successfully"});
    }
    catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({message: "Error deleting message: " + err.message});
    }
}
const getStatus = async (req, res) => {
    res.json({status: "OK, server is running"});
}
module.exports = { getMessage, createMessage, updateMessage, deleteMessage, getStatus}