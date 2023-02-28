const Txns = require("../../models/transaction.model")
const Rate = require("../../models/rate.model")
const respond = require("../../util/sendResponse")

const TXN_TYPE = 'WITHDRAWAL'

exports.getAllWithdrawals = async (req, res) => {
    const { pgs, pgn } = req.query
    try {
        const txns = await Txns.aggregate([
            {
                $sort: { _id: -1 }
            },
            {
                $match: {
                    txn_type: TXN_TYPE
                }
            },
            {
                $facet: {
                    doc: [
                        {
                            $skip: +pgs * (+pgn - 1),
                        },
                        {
                            $limit: +pgs,
                        },
                    ],
                    totalCount: [
                        {
                            $count: "count",
                        },
                    ],
                },
            }
        ]);
        const docs = txns[0]?.doc;
        const totalPgs = txns[0]?.totalCount[0]?.count ?? 1
        const data = {
            data: docs,
            totalPageSize: totalPgs,
            pageSize: docs?.length
        }
        respond(res, data, 'Success', 201, true)
        
    } catch (error) {
        respond(res, null, error.message, 500)
    }
}

exports.getWithdrawal = async (req, res) => {
    const txnId = req.params.txnId
    try {
        const txn = await Txns.findOne({ _id: txnId, txn_type: TXN_TYPE });
        if (!txn) {
            return respond(res, null, 'Transaction does not exist')
        }
        return respond(res, txn, 'Success', 201, true)
        
    } catch (error) {
        respond(res, null, error.message)
    }
}

exports.approveWithdrawl = async (req, res) => {
    const withdrawalId = req.params.id

    try {
        const txn = Txns.findOne({ _id: withdrawalId, txn_type: TXN_TYPE})
        const rate = Rate.findOne({ type: 'USD' })

        txn.txn_status = 'SENT';
        txn.txnRate = rate.rate;
        await txn.save({ validateBeforeSave: false })
        respond(res, null, 'Withdrawal approved successfully', 201, true)
    } catch (error) {
        respond(res, null, error.message)
    }
}