const cron = require('node-cron');
const options = require("./constants").configOptions
const env = require("../config/config")
const {MyReadable, MyWritable} = require("./stream-txns");
const fetch = require("./fetch")
const txnType = require("./txnType")


const cronJob = cron.schedule('*/60 * * * *', async () => {
    try {
        let brxTxns
        console.log('starting.... scheduler');
        // Do something with the response
        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const normalUrl = `${BREX_URL}/transactions/card/primary/?limit=25`;
        const url = normalUrl
        
        brxTxns = await (await fetch(url, params)).json()
        
        const txns = brxTxns.items.filter(txn => txnType(txn.type))
        // console.log(txns);

        const readable = new MyReadable(txns);
        const writable = new MyWritable();
        readable.pipe(writable);
    } catch (err) {
        console.log(err);
    }
});

const stopCronJob = () => {
    console.log('stopping.....cronJob');
    cronJob.stop()
    // process.exit();
}

module.exports = {cronJob, stopCronJob}
