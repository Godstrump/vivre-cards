const respond = require("../../util/sendResponse");
const User = require("../../models/user.model");
const fetch = require("../../util/fetch");
const options = require("../../util/constants").configOptions;
const config = require("../../config/config");
const Card = require("../../models/card.model");

const lockCard = async (req, res) => {
    const cardId = req.params.cardId;
    const owner = req.user._id
    const { description, reason } = req.body;

    try {
        const card = await Card.findOne({ _id: cardId, owner });
        if (card) {
            const body = {
                description,
                reason,
            };
    
            const params = {}
            params.method = 'POST'
            params.headers = options.headers
            const url = `${config.brex_url}/cards/${card.card_id}/lock`;
            params.headers.Authorization = `Bearer ${config.brex_token}`;
            params.headers["Content-Type"] = "application/json";
            params.body = JSON.stringify(body);
    
            await (await fetch(url, params)).json();
            card.status = "FREEZED";
            await card.save();
            return respond(res, null, "Request successful", 201, true);
        }
        return respond(res, null, 'card not found', 404)
    } catch (error) {
        respond(res, null, error.message);
    }
};

const terminateCard = async (req, res) => {
    // const id = req.query.id;
    const cardId = req.params.cardId;
    const { description, reason } = req.body;
    const owner = req.user._id

    try {
        const card = await Card.findOne({ _id: cardId, owner });
        if (card) {
            const body = {
                description,
                reason,
            };
    
            const params = {}
            params.method = 'POST'
            params.headers = options.headers
            const url = `${config.brex_url}/cards/${card.card_id}/terminate`;
            params.headers.Authorization = `Bearer ${config.brex_token}`;
            params.headers["Content-Type"] = "application/json";
            params.body = JSON.stringify(body);
    
            await (await fetch(url, params)).json();
            card.status = "TERMINATED";
            await card.save({ validateBeforeSave: false });
            return respond(res, null, "Request successful", 201, true);
        }
        return respond(res, null, 'card not found', 404)
    } catch (error) {
        respond(res, null, error.message);
    }
};

const unlockCard = async (req, res) => {
    // const id = req.query.id;
    const cardId = req.params.cardId;
    const owner = req.user._id
    try {
        const card = await Card.findOne({ _id: cardId, owner });
        if (card) {
            const params = {}
            params.method = 'POST'
            params.headers = options.headers
            const url = `${config.brex_url}/cards/${card.card_id}/unlock`;
            params.headers.Authorization = `Bearer ${config.brex_token}`;
            params.headers["Content-Type"] = "application/json";
    
            await (await fetch(url, params)).json();
            card.status = "ACTIVE";
            await card.save();
    
            return respond(res, null, "Request successful", 201, true);
        }
        return respond(res, null, 'User card does not exist', 404)
    } catch (error) {
        respond(res, null, error.message);
    }
};

const fetchCards = async (req, res) => {
    const id = req.user._id
    try {
        const cards = await Card.find(
            { owner: id, status: { $not: { $regex: "(TERMINATED)" } } },
            {
                _id: 0,
                id: "$_id",
                card_name: 1,
                spend_limit: 1,
                cash_available: "$spend_available",
                status: 1,
                expiry_date: "$card_details.expiration_date",
                card_details: 1,
            }
        ).select("+card_details");
        return respond(res, cards, "Success", 201, true);
    } catch (error) {
        respond(res, null, error.message);
    }
};

const getBrxCardDetails = async (req, res) => {
    const id = req.params.id
    const userId = req.user._id

    try {
        const card = await Card.findOne({ _id: id, owner: userId })
        if (card) {
            const params = {}
            params.method = 'POST'
            params.headers = {}
            const url = `${config.brex_url}/cards/${card.card_id}/pan`;
            params.headers.Authorization = `Bearer ${config.brex_token}`;
            params.headers["Content-Type"] = "application/json";
            params.body = JSON.stringify(body);
    
            const detail = await (await fetch(url, params)).json(); 
            return respond(res, detail, "Success", 201, true)
        }
        return respond(res, null, 'card not found', 404)
    } catch (error) {
        
    }
}

const getCardDetails = async (req, res) => {
    const id = req.params.id
    const userId = req.user._id

    console.log(userId);

    try {
        const card = await Card.findOne({ _id: id, owner: userId }).select("+card_details")
        if (card) {
            delete card?.card_details?.id
            const data = {
                card_details: card.card_details
            }
            return respond(res, data, "Success", 201, true)
        }
        return respond(res, null, 'card not found', 404)
    } catch (error) {
        respond(res, null, error.message, 500)
    }
}

const updateCard = async (req, res) => {
    const cardId = req.params.cardId;
    const { spend_limit } = req.body;
    const owner = req.user._id
    const isSpendLimit = spend_limit ===  null || spend_limit === undefined
    if (isSpendLimit) return respond(res, null, 'Spend limit can not be null')
    try {
        const amount = +spend_limit * 100
        const card = await Card.findOne({ _id: cardId, owner });
        if (card) {
            const body = {
                spend_controls: {
                    spend_limit: {
                        amount,
                        currency: 'USD'
                    },
                    spend_dureation: "ONE_TIME",
                    reason: null,
                    lock_after_date: null
                },
                metadata: null
            };
    
            const params = {}
            params.method = 'PUT'
            params.headers = options.headers
            const url = `${config.brex_url}/cards/${card.card_id}`;
            params.headers.Authorization = `Bearer ${config.brex_token}`;
            params.headers["Content-Type"] = "application/json";
            params.body = JSON.stringify(body);
            const cc = await (await fetch(url, params)).json();

            card.spend_limit = cc.spend_controls?.spend_limit
            await card.save({ validateBeforeSave: false });
            return respond(res, card, "Request successful", 201, true);
        }
        return respond(res, null, 'card not found', 404)
    } catch (error) {
        respond(res, null, error.message);
    }
}

module.exports = { lockCard, terminateCard, unlockCard, fetchCards, getCardDetails, getBrxCardDetails, updateCard };
