const sendResponse = (
    res,
    data = null,
    msg = "Request unsuccessfull",
    status = 400,
    success = false
) => {
    return res.status(status).send({
        success,
        message: msg,
        data,
    });
};

module.exports = sendResponse;
