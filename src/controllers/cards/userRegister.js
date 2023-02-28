const User = require("../../models/user.model");
const Sheet = require("../../models/sheet.model")
// const Company = require("../../models/company.model");
const Card = require("../../models/card.model");
const config = require("../../config/config");
// const projectUser = require("../../util/constants").projectUser;
const options = require("../../util/constants").configOptions;
const respond = require("../../util/sendResponse");
const fetch = require("../../util/fetch");
const pushMail = require("../../util/awsSendEmail");
const mailOptions = require("../../util/constants").pushEmailOptions;
const emailTemplate = require("../../templates/cardTemplates");

const registerBrex = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findOne({ _id: id });

        if (!user) {
            return respond(res, null, "User does not exist");
        }

        if (!user?.hasComplianceApproved) {
            return respond(res, null, "Compliance has not been approved");
        }

        if (user?.hasComplianceError) {
            return respond(
                res,
                null,
                "Compliance error exist. Fix and try again"
            );
        }

        if (user) {
            console.log(user);
            const body = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.account_email,
            };
            const url = `${config.brex_url}/users`;
            delete options.url;
            options.headers.Authorization = `Bearer ${config.brex_token}`;
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);

            console.log(options);

            const doc = await (await fetch(url, options)).json();

            console.log(doc);

            user.brexId = doc?.id;
            await user.save({ validateBeforeSave: false });
            respond(res, doc, "User created successfully", 200, true);
        }
    } catch (error) {
        respond(res, null, error.message);
    }
};

const createCard = async (req, res) => {
    // const id = req.query.id;
    const { card_name, reason, spend_limit } = req.body;

    try {
        const user = req.user
        const sheet = await Sheet.find({ owner: user._id })
        if (spend_limit > sheet.balance) {
            return respond(res, null, 'Spend limit is greater than balance')
        }
        // const company = await Company.findOne({ owner: id })
        const totalCards = await Card.find({ owner: user?._id });
        // const isSpendLimit = totalCards.reduce((acc, curr) => acc + curr.,0)
        const idemKey = totalCards.length;
        const brexSpendLimit = spend_limit * 100
        console.log(idemKey);
        const body = {
            owner: {
                type: "USER",
                user_id: user?.brexId,
            },
            card_name: card_name,
            card_type: "VIRTUAL",
            limit_type: "CARD",
            spend_controls: {
                spend_limit: {
                    amount: brexSpendLimit,
                    currency: "USD",
                },
                spend_duration: "ONE_TIME",
                reason: reason,
            },
            mailing_address: null,
            metadata: {
                vendgramId: user?._id,
            },
            card_attribute_preferences: null,
        };
        let url;
        delete options.url;
        options.headers["Content-Type"] = "application/json";
        options.headers["Idempotency-Key"] = `${user?._id}-${idemKey}`;
        options.headers.Authorization = `Bearer ${config.brex_token}`;
        options.body = JSON.stringify(body);
        url = `${config.brex_url}/cards`;
        console.log(options);

        //cc stands for create card --- create card on brex
        const cc = await (await fetch(url, options)).json();

        const card = new Card({
            owner: cc?.metadata?.vendgramId,
            card_name: cc?.card_name,
            card_type: cc?.card_type,
            card_id: cc?.id,
            brex_owner: {
                id: cc?.owner?.user_id,
                type: "USER",
            },
            idempotencyKey: `${user?._id}-${idemKey}`,
            limit_type: cc?.limit_type,
            spend_limit: cc?.spend_controls.spend_limit,
            spend_available: cc?.spend_controls.spend_available,
            spend_duration: cc?.spend_controls?.spend_duration,
            billing_address: cc?.billing_address,
            last_four: cc?.last_four,
            status: cc?.status,
        });
        
        const params = {}
        url = `${config.brex_url}/cards/${cc?.id}/pan`;
        params.method = "GET";
        params.headers = options.headers
        console.log("cc", params);

        const cardDetails = await (await fetch(url, params)).json();
        card.card_details = cardDetails;

        //save card
        await card.save();

        const cardNum = `**** **** **** ${cc?.last_four}`;
        const expiry = `${
            cardDetails.expiration_date?.month
        }/${cardDetails?.expiration_date.year
            .toString()
            .split("")
            .slice(-2)
            .join("")}`;
        mailOptions.email = user?.account_email;
        mailOptions.subject = "Card Details";
        mailOptions.message = emailTemplate(cc.card_name, cardNum, expiry);
        mailOptions.source = "support@vendgram.co";

        await pushMail(mailOptions);

        const data = {
            cardDetails,
        };

        respond(res, data, "Card created successfully", 200, true);
    } catch (error) {
        respond(res, null, error.message, 500);
    }
};

module.exports = { registerBrex, createCard };
