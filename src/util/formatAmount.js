const formatAmount = (amount) => {
    const x = (+amount).toFixed(2)
    return +x
}

module.exports = formatAmount