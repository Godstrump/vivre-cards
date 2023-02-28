const providusTxnValidation = async (req, res, next) => {
    let response ={};
    const { sessionId, accountNumber, settlementId } = req.body

    if (settlementId || accountNumber) {
        response.requestSuccessful = false
        response.sessionId = sessionId;
        response.responseMessage = 'rejected transaction'
        response.responseCode = '02'
        return res.json(response)
    }

    return next()
}