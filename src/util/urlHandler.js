const urlHandler = (req, path) => {
    let prefix = "";
    if (process.env.NODE_ENV === "development") {
        prefix = `${req.protocol}://localhost:3000`;
    } else if (process.env.NODE_ENV === "production") {
        prefix = `${req.protocol}://${req.get("host")}`;
    }
    return `${prefix}/${path}`;
};

module.exports = urlHandler;
