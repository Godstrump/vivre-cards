const Transaction = require("../models/transaction.model")

async function uuid() {
  const txns = await Transaction.aggregate([ { $count: "total" }])
  const count = txns[0].total
  const id = `VG-xxxxxyyxxxxx4xxxyy${count}`.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(32);
  });
  
  console.log(id);
    return id
  }
  
module.exports = uuid