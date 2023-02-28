const round = require('./formatAmount')

const calcTotal = (rate, amount, FEE_PERCENT, FLAT_FEE_USD) => {
    const fee = (round(FEE_PERCENT * +amount)) + +FLAT_FEE_USD;

    const dollar = +amount + fee
    const naira = round(+dollar * rate)
    return {
        naira,
        dollar,
        fee
    }
}

module.exports = calcTotal