module.exports = {
    getUsers: async (req, res, next) => {
        console.log("Middleware is running");
        next();
    }
}