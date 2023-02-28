const Txns = require("../../models/transaction.model");
const respond =  require("../../util/sendResponse")

const TXN_TYPE = 'DEPOSIT'

exports.getAllDeposits = async (req, res) => {
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
        respond(res, null, error.message)
    }
}

exports.getDeposit = async (req, res) => {
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

exports.getTotalDeposits = async (req, res) => {
    try {
        const deposits = await Txns.aggregate([
            {
                $match: {
                    txn_status: 'RECEIVED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalDeposits: { $sum: "$depositInDollar"}
                }
            },
            {
                $project: {
                    _id: 0,
                    totalDeposits: "$totalDeposits"
                }
            }
        ])
        return respond(res, {totalDeposits: deposits[0].totalDeposits}, 'success', 201, true)
    } catch (error) {
        return respond(res, null, error.message, 500)
    }
}