const respond = require('./sendResponse')

const validateUser = (req, res, next) => {
    const user = req.user

    if (!user) {
        return respond(res, null, "User does not exist");
    }

    if (!user?.is_activated) {
        return respond(res, null, "User not verified");
    }

    if (!user?.hasComplianceApproved) {
        return respond(res, null, "Compliance has not been approved");
    }

    if (user?.hasComplianceError) {
        return respond(res, null, "Compliance error exist. Fix and try again");
    }
    return next()
};

module.exports = validateUser;
