const txnType = (x) => ['PURCHASE', 'PENDING', 'REFUND'].includes(x)

module.exports = txnType