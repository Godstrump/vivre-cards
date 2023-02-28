const Wbhk = require('../../models/webhook-logs')
const respond = require('../../util/sendResponse')

exports.getExpenseWbhk = async (req, res) => {
    const data = req.body;

    try {
        const web = await Wbhk.create(data)
        console.log(web);
        res.json(web)

    } catch(err) {
        respond(res, null, err.message)
    }
}