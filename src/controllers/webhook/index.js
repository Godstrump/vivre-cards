const pushEmail = require("../../util/awsSendEmail");
const User = require("../../models/user.model")
const ComplInfo = require("../../models/company-compliance.model")

exports.parsio = async (req, res) => {
    try {
        const { message, to } = req.body
        const user = await User.findOne({ brexEmail: to })

        await pushEmail({
            email: user?.account_email,
            subject: "Vendgram Verification code",
            message: message,
            source: "vendgram@vendgram.co",
        });

        res.send()
    } catch(err) {
        console.error(err);
        res.end()
    }
}

exports.cacWebhook = async (req, res) => {
    try {
        const body = req.body;
        if (body.error) return res.send(400)
        const data = await ComplInfo.create(body.data)
        console.log(data);
        res.send(200)

    } catch (error) {
        res.send(400)
    }
}
