const BrxTxns = require("../../models/brexCardTxns.model")
const respond = require("../../util/sendResponse")

exports.getCardTxns = async (req, res) => {
    const cardId = req.params.id
    const { pgn, pgs } = req.query
    try {
        const txns = await BrxTxns.aggregate([
            { $sort: { _id: -1 } },
            {
                $match: {
                    _id: cardId
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
        respond(res, data, 'Request successful', 201, true)
    } catch (error) {
        respond(res, null, error.message)
    }
}

exports.getAllCardTxns = async (req, res) => {
    const { pgn, pgs } = req.query
    try {
        const txns = await BrxTxns.aggregate([
            { $sort: { _id: -1 } },
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
        // console.log(docs)
        const totalPgs = txns[0]?.totalCount[0]?.count ?? 1
        const data = {
            data: docs,
            totalPageSize: totalPgs,
            pageSize: docs?.length
        }
        respond(res, data, 'Request successful', 201, true)
    } catch (error) {
        respond(res, null, error.message)
    }
}

exports.getTotalSpent = async (req, res) => {
    try {
        const txns = await BrxTxns.aggregate([
            {
                $match: {
                    txnType: 'PURCHASE'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount.amount"}
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSpent: "$totalSpent"
                }
            }
        ])
        const totalSpent = (txns[0].totalSpent/100)
        return respond(res, {totalSpent}, 'success', 201, true)
    } catch (error) {
        return respond(res, null, error.message, 500)
    }
}