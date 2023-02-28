const respond = require('../util/sendResponse')

const isUserActivated = async (req, res, next) => {
    const user = req.user
    if (!user) {
        return respond(res, null, "User does not exist");
    }

    if (!user?.is_activated) {
        return respond(res, null, "User not verified");
    }
    return next()
};

module.exports = isUserActivated;
