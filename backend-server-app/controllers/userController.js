const User = require("../models/userModel");

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({message: "Error fetching users"});
    }
}

module.exports = {
    getUsers
};