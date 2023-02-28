const { Readable, Writable } = require('stream');
const BrexCardTxn = require("../models/brexCardTxns.model")
const Card = require("../models/card.model")
const Sheet = require("../models/sheet.model")

class MyReadable extends Readable {
    constructor(data) {
        super();
        this.data = data;
    }

    _read() {
        if (!this.data.length) {
            this.push(null);
            return;
        }
        // console.log(this.data);
        const obj = this.data.shift();
        this.push(JSON.stringify(obj));
    }
}

class MyWritable extends Writable {
    async _write(chunk, encoding, callback) {
        const txn = JSON.parse(chunk.toString())
        const card = await Card.findOne({ card_id: txn.card_id })
        const isTxn = await BrexCardTxn.findOne({ txnId: txn.id })
        // console.log(isTxn);
        if (!isTxn) {
            // const actualAmount = txn.amount.amount / 100
            // const isType = (x) => ['PURCHASE', 'PENDING'].includes(x)
            // const userSheet = await Sheet.findOne({ owner: card.owner })
            // let newBalance
            // if (isType(txn?.type)) {
            //     newBalance = userSheet.balance - actualAmount
            //     userSheet.balance = newBalance
            //     userSheet.save({ validateBeforeSave: false })
            // } else {
            //     newBalance = userSheet.balance + actualAmount
            //     userSheet.balance = newBalance
            //     userSheet.save({ validateBeforeSave: false })
            // }
            const obj = {
                owner: card?.owner ?? 'Test',
                txnId: txn.id,
                card_id: txn.card_id,
                amount: txn.amount,
                created_at: txn.initiated_at_date,
                updated_at: txn.posted_at_date,
                txnType: txn.type,
                merchant: txn.merchant,
                txnDesc: txn.description
            }
            BrexCardTxn.insertMany(obj, (err, res) => {
                if (err) throw err;
                console.log(`Inserted ${res.insertedCount} documents`);
            })
        }
        callback();
    }
}

module.exports = {
    MyReadable,
    MyWritable
}
