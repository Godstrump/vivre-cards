const writeResponse = (
    res,
    data = null,
    msg = "Request unsuccessfull",
    status = 201,
    success = true
) => {
    const rawData = {
        success,
        message: msg,
        data,
    }
    const json = JSON.stringify(rawData)
    return res.write(json);
};

module.exports = writeResponse;
