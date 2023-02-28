const convertToBrxAmount = (amount) => {
    const x = amount.split('.').join('')
    return x
}

module.exports = convertToBrxAmount