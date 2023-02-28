const env = require("../config/config")
const options = require("./constants").configOptions

const getTransactions = async () => {
    const BREX_URL = env.brex_url
    const params = {}
    params.headers = options.headers
    params.headers.Authorization = `Bearer ${env.brex_token}`;
    params.headers["Content-Type"] = "application/json";
    params.method = "GET"
    const url = `${BREX_URL}/transactions/card/primary`
    
    const brxTxns = await (await fetch(url, params)).json()

    const txns = brxTxns.items.filter(txn => txn.type === 'PURCHASE' || txn.type === 'REFUND')
    return txns;
}

module.exports = getTransactions