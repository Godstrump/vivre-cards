const reverseCalcTotal = (rate, naira, FEE_PERCENT, FLAT_FEE_USD) => {
    const dollar = +((((naira / rate) / (1+FEE_PERCENT)) - FLAT_FEE_USD) + 0.12).toFixed(2);
    return {
        dollar
    }
}

module.exports = reverseCalcTotal