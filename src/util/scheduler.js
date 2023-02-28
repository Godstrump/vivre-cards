const options = require("./constants").configOptions
const env = require("../config/config")
const {MyReadable, MyWritable} = require("./stream-txns");
const fetch = require("./fetch")
const txnType = require("./txnType")

let intervalId;
let isFetching = false;

async function startScheduler() {
    if (!isFetching) {
      isFetching = true;
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
        console.log("Error: " + err.message);
      } finally {
        isFetching = false;
      }
  
      intervalId = setTimeout(startScheduler, 1800000);
    }
  }

function stopScheduler() {
    console.log('stopping.....scheduler');
    clearTimeout(intervalId);
    isFetching = true;
}

module.exports = {
    startScheduler,
    stopScheduler
}