const Transaction = require("../../models/transaction.model");
const options = require("../../util/constants").configOptions
const env = require("../../config/config")
const fetch = require("../../util/fetch")
const respond = require("../../util/sendResponse")
const Card = require("../../models/card.model")
const {MyReadable, MyWritable} = require("../../util/stream-txns")
const txnType = require("../../util/txnType")
const BrexTxns = require("../../models/brexCardTxns.model")

exports.getAllTransactions = async (req, res) => {
    const cursor = req.query.cursor
    try {
        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const normalUrl = `${BREX_URL}/transactions/card/primary/?limit=30`;
        const url = cursor ? `${normalUrl}&cursor=${cursor}` : normalUrl
        
        const brxTxns = await (await fetch(url, params)).json()

        const txns = brxTxns.items.filter(txn => txnType(txn.type))
        const data = {next_cursor: brxTxns?.next_cursor, txns}
        respond(res, data, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};

exports.getAllBrexTxns = async (req, res) => {
    const { pgn, pgs } = req.query
    try {

        let docs;
        let totalPageSize;
        let data;

        const brxTxns = await BrexTxns.aggregate([
            {
                $sort: { _id: -1 }
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

        docs = brxTxns[0].doc;
        totalPageSize = brxTxns[0].totalCount[0].count;
        data = {
            data: docs,
            totalPageSize,
            pageSize: docs?.length
        }

        respond(res, data, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};

exports.getUserTransactions = async (req, res) => {
    const owner = req.user._id
    const cursor = req.query.cursor
    try {

        const userCards = await Card.find({ owner: owner })

        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const normalUrl = `${BREX_URL}/transactions/card/primary/?limit=30`;
        const url = cursor ? `${normalUrl}&cursor=${cursor}` : normalUrl
        
        const brxTxns = await (await fetch(url, params)).json()

        if (!userCards.length) return respond(res, null, 'No transactions for this user', 204, true)

        const txns = brxTxns.items.filter(txn => txnType(txn.type))
        const map = new Map(userCards.map(item => [item.card_id, item]));
        const userTxns = txns.filter(txn => map.has(txn.card_id));
        const data = {next_cursor: brxTxns?.next_cursor, userTxns}
        respond(res, data, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};

exports.getUserBrexTxns = async (req, res) => {
    const owner = req.user._id
    const { pgn, pgs } = req.query
    try {

        let docs;
        let totalPageSize;
        let data;

        const userCards = await Card.find({ owner: owner })        
        if (!userCards.length) return respond(res, null, 'No transactions for this user', 204, true)

        const brxTxns = await BrexTxns.aggregate([
            {
                $sort: { _id: -1 }
            },
            {
                $match: {
                    card_id: { $in: userCards }
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
        console.log(brxTxns);
        docs = brxTxns[0]?.doc;
        totalPageSize = brxTxns[0].totalCount[0]?.count ?? 1;
        data = {
            data: docs,
            totalPageSize,
            pageSize: docs?.length
        }
        
        respond(res, data, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};


exports.getCardTransactions = async (req, res) => {
    const cardId = req.params.id
    try {

        const card = await Card.findOne({ _id: cardId })

        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const url = `${BREX_URL}/transactions/card/primary`
        
        const brxTxns = await (await fetch(url, params)).json()

        const txns = brxTxns.items.filter(txn => txnType(txn.type))
        const cardTxns = txns.filter(txn => txn.card_id === card.card_id)
        respond(res, cardTxns, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};

exports.getBrxCardTxns = async (req, res) => {
    const cardId = req.params.id
    const { pgn, pgs } = req.query
    try {

        let docs;
        let totalPageSize;
        let data;

        const card = await Card.findOne({ _id: cardId })
        const brxTxns = await BrexTxns.aggregate([
            {
                $sort: { _id: -1 }
            },
            {
                $match: {
                    card_id: card.card_id
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
        
        docs = brxTxns[0].doc;
        totalPageSize = brxTxns[0].totalCount[0]?.count ?? 1;
        data = {
            data: docs,
            totalPageSize,
            pageSize: docs?.length
        }
        
        respond(res, data, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};


exports.streamAllTransactions = async (req, res) => {
    const cursor = req.query.cursor
    try {
        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const normalUrl = `${BREX_URL}/transactions/card/primary/?limit=20`;
        const url = cursor ? `${normalUrl}&cursor=${cursor}` : normalUrl
        
        const brxTxns = await (await fetch(url, params)).json()
        const txns = brxTxns.items.filter(txn => txnType(txn.type))

        const readable = new MyReadable(txns);
        const writable = new MyWritable();
        readable.pipe(writable);
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};


exports.getUserTotalSpent = async (req, res) => {
    const owner = req.user._id
    const { dateRange } = req.query
    const today = new Date();
    let query;

    try {
        let data;

        const userCards = await Card.find({ owner })        
        if (!userCards.length) return respond(res, null, 'No transactions for this user', 204, true)

        switch (dateRange) {
            case "This Week":
              const thisWeekStart = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() - today.getDay()
              );
              const thisWeekEnd = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate() + (6 - today.getDay())
              );
              query = { card_id: { $in: userCards }, createdDate: { $gte: thisWeekStart, $lte: thisWeekEnd } };
              break;
            case "This Month":
              const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              const thisMonthEnd = new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0
              );
              query = { card_id: { $in: userCards }, createdDate: { $gte: thisMonthStart, $lte: thisMonthEnd } };
              break;
            case "Last 8 Months":
              const last8MonthsStart = new Date(
                today.getFullYear(),
                today.getMonth() - 5,
                1
              );
              const last8MonthsEnd = new Date(today.getFullYear(), today.getMonth(), 0);
              query = { card_id: { $in: userCards }, createdDate: { $gte: last8MonthsStart, $lte: last8MonthsEnd } };
              break;
            case "This Year":
              const thisYearStart = new Date(today.getFullYear(), 0, 1);
              const thisYearEnd = new Date(today.getFullYear(), 11, 31);
              query = { card_id: { $in: userCards }, createdDate: { $gte: thisYearStart, $lte: thisYearEnd } };
              break;
            default:
                query = { card_id: { $in: userCards } };
        }

        const brxTxns = await BrexTxns.aggregate([
            {
                $sort: { _id: -1 }
            },
            {
                $match: query
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount.amount" }
                }
            },
        ]);
        data = {
            totalAmount: brxTxns[0]?.totalAmount ?? 0
        }
        
        respond(res, data, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
}