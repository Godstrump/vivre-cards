const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/admin.model");
const User = require("../../models/user.model");
const Card= require("../../models/card.model");
const Company = require("../../models/company.model");
const Bill = require("../../models/bill.model");
const Transaction = require("../../models/transaction.model");
const sendEmail = require("../../util/sendEmail");
const pushEmail = require("../../util/awsSendEmail");
const template =
    require("../../templates/complianceErrorTemplate").complianceErrorTemplate;
const respond = require("../../util/sendResponse");
// const projectUser = require('../../util/constants').projectUser
const Rate = require('../../models/rate.model')
const env = require('../../config/config')
const options = require("../../util/constants").configOptions
const fetch = require('../../util/fetch')
const Sheet =  require("../../models/sheet.model")
const write = require("../../util/writeResponse")
const AWS = require("../../config/aws")

exports.adminLogout = async (req, res) => {
    try {
        res.cookie("token", "none", { expires: new Date(Date.now() + 10000) });
        respond(res, null, 'Admin logged out successfully', 201, true);
    } catch (err) {
        respond(res, null, err.message)
    }
};

exports.adminLogin = async (req, res) => {
    const { email, pin } = req.body;
    let msg;
    if (!email || !pin) {
        msg = 'Please enter your email and pin'
        return respond(res, null, msg)
    }
    try {
        const admin = await Admin.findOne({ admin_email: email.toLowerCase() }).select(
            "+admin_pin"
        );
        msg = 'Invalid credentials'
        if (!admin) {
            respond(res, null, msg, 401)
        }
        const isMatch = await bcrypt.compare(pin, admin.admin_pin);
        if (!isMatch) {
           return respond(res, null, msg, 401)
        }
        if ((isMatch, admin)) {
            const token = jwt.sign(
                {
                    _id: admin._id,
                    read: "all",
                    create: "all",
                    update: "all",
                    delete: "all",
                },
                env.admin_secret
            );
            const data = {
                user: {
                    email: admin.admin_email
                },
                token: token
            }
            msg = 'Login successful'
            respond(res, data, msg, 201, true)
        }
    } catch (err) {
        respond(res, null, err.message, 500)
    }
};

exports.createAdmin = async (req, res) => {
    let msg;
    const { email, pin } = req.body;
    if (!email || !pin) {
        msg = 'Please enter your email and pin'
        return respond(res, null, msg)
    }
    const admin = await Admin.findOne({ admin_email: email });
    if (admin) {
        msg = 'Admin with this email already exist'
        return respond(res, null, msg)
    }
    const salt = await bcrypt.genSalt(10);
    hashedPin = await bcrypt.hash(pin, salt);
    const newAdmin = new Admin({
        admin_email: email.toLowerCase(),
        admin_password: hashedPin,
        admin_pin: hashedPin,
    });
    try {
        const newSavedAdmin = await newAdmin.save();
        if (newSavedAdmin) {
            const message = `<p>Your admin account on Vendgram was created successful.</p><br>
            <p>Your sign in email is: ${email}</p><br>
            <p>Your account number is: ${pin}</p>`;
            
            await pushEmail({
                email: email,
                subject: "Welcome Vendgram Admin",
                message: message,
                source: "support@vendgram.co",
            });
            msg = "Admin account created successfully"
            respond(res, null, msg)
        }
    } catch (err) {
        respond(res, null, err.message, 500)
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { pgs, pgn } = req.query;

        let users;
        let totalPageSize;
        let data;

        const userProject = {
            emailVerificationToken: 0,
        }

        const docs = await User.aggregate([
            {
                $sort: { _id: -1 }
            },
            {
                $project: userProject
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

        users = docs[0].doc;
        totalPageSize = docs[0].totalCount[0].count;
        data ={
            data: users,
            totalPageSize,
            pageSize: users?.length
        }

        respond(res, data, 'Request successful', 201, true)
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getOneUser = async (req, res) => {
    const id = req.params.id;
    
    let msg;

    if (!id) {
        msg = 'Invalid Request'
        return respond(res, null, msg)
    }
    try {
        const user = await User.findOne({ _id: id });
        if (!user) {
            msg = 'User not found'
            return respond(res, null, msg, 404, false)
        }
        msg = 'Request successful'
        respond(res, user, msg, 201, true)
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.createUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({
            status: false,
            message: "Please enter email and password",
        });
    }
    const user = await User.findOne({ account_email: email });
    if (user) {
        return res.status(400).send({
            status: false,
            message: "A user with this email already exists",
        });
    }
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
        account_email: email,
        account_password: hashedPassword,
    });
    try {
        const user = await newUser.save();
        if (user) {
            res.status(200).send({
                status: true,
                message: "User Registration Successful",
            });
            const message = `<p>Your registration on Vendgram was successful.</p><br>
                            <p>Your sign in email is: ${user.account_email}</p><br>
                           `;
            await sendEmail({
                email: user.account_email,
                subject: "Welcome to Vendgram",
                message: message,
            });
        }
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getUserCards = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findOne({ _id: id });

        if (user) {
            const cards = await Card.find(
                { owner: user._id }
            ).populate("owner")
            return respond(res, cards, "Success", 201, true);
        }

        return respond(res, null, 'User does not exist', 404, false)

    } catch (error) {
        respond(res, null, error.message);
    }
};

exports.getCardDetails = async (req, res) => {
    const id = req.params.id;

    try {
        const card = await Card.findOne(
            { _id: id }
        ).populate("owner")
        return respond(res, card, "Success", 201, true);

    } catch (error) {
        respond(res, null, error.message);
    }
};

exports.getAllCards = async (req, res) => {
    try {
        const { pgs, pgn } = req.query;

        let cards;
        let totalPageSize;
        let data;

        const userProject = {
            emailVerificationToken: 0,
        }

        const docs = await Card.aggregate([
            {
                $sort: { _id: -1 }
            },
            {
                $project: userProject
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

        cards = docs[0].doc;
        totalPageSize = docs[0].totalCount[0].count;
        data ={
            data: cards,
            totalPageSize,
            pageSize: cards?.length
        }

        respond(res, data, 'Request successful', 201, true)

    } catch (error) {
        respond(res, null, error.message);
    }
};

exports.getUserCompany = async (req, res) => {
    const id = req.params.id
    let data;
    try {
        const user = await User.findOne({ _id: id })
        if (user) {
            console.log(user._id);
            const company = await Company.findOne({ owner: user._id })
            const addressUrl = await AWS.getGetSignedUrl(
                company?.addressProof
            );
            const docIdUrl = await AWS.getGetSignedUrl(company?.documentId);
            company.addressProof = addressUrl;
            company.documentId = docIdUrl
            data = {
                company
            }
            return respond(res, company, 'Request successful', 201, true)
        }
        return respond(res, null, 'User does not exist', 404, false)
    } catch (err) {
        respond(res, null, err.message, 500);
    }
}


exports.enableUser = async (req, res) => {
    const { account_email } = req.body;
    const account = await User.findOne({ account_email: account_email });
    if (!account) {
        return res.status(401).send({
            status: false,
            message: "Invalid request. User with account not found",
        });
    }
    if (account.is_activated === true) {
        return res
            .status(401)
            .send({ status: false, message: "User is already active" });
    } else {
        await User.updateOne(
            { account_email: account_email },
            { $set: { is_activated: true } },
            { new: true }
        );
        return res
            .status(200)
            .send({ status: true, message: "User activated successfully" });
    }
};

exports.disableUser = async (req, res) => {
    const { account_email } = req.body;
    const account = await User.findOne({ account_email: account_email });
    if (!account) {
        return res.status(401).send({
            status: false,
            message: "Invalid request. User with account not found",
        });
    }
    if (account.is_activated === false) {
        return res
            .status(401)
            .send({ status: false, message: "User is already disabled" });
    } else {
        await User.updateOne(
            { account_email: account_email },
            { $set: { is_activated: false } },
            { new: true }
        );
        return res
            .status(200)
            .send({ status: true, message: "User deactivated successfully" });
    }
};

exports.createBill = async (req, res) => {
    const { name, type, amount } = req.body;
    if (!name || !type || !amount) {
        return res.status(400).send({
            status: false,
            message: "Please enter name, type and amount",
        });
    }
    const bill = await Bill.findOne({ Bill_Name: name, Bill_Type: type });
    if (bill) {
        return res
            .status(400)
            .send({ status: false, message: "This bill already exists" });
    }
    try {
        const newBill = new Bill({
            Bill_Name: name,
            Bill_Type: type,
            Bill_Amount: amount,
        });
        const bill = await newBill.save();
        if (bill) {
            res.status(200).send({
                status: true,
                message: "Bill Created Successful",
            });
        }
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find().sort({ _id: "desc" });
        res.status(200).send({ status: true, data: bills });
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getOneBill = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res
            .status(400)
            .send({ status: false, message: "Invalid Request" });
    }
    try {
        const bill = await Bill.findOne({ _id: id });
        if (!bill) {
            res.status(200).send({ status: false, message: "Bill not found" });
        }
        res.status(200).send({ status: true, data: bill });
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ _id: "desc" });
        res.status(200).send({ status: true, data: transactions });
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getOneTransaction = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res
            .status(400)
            .send({ status: false, message: "Invalid Request" });
    }
    try {
        const transaction = await Transaction.findOne({ _id: id });
        res.status(200).send({ status: true, data: transaction });
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getAllUserTransactions = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res
            .status(400)
            .send({ status: false, message: "Invalid Request" });
    }
    try {
        const transactions = await Transaction.find({ userId: id });
        res.status(200).send({ status: true, data: transactions });
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.getComplianceErrors = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findOne(
            { _id: id },
            {
                _id: 0,
                emailVerificationToken: 0,
                created_at: 0,
                updated_at: 0,
                emailVerificationDate: 0,
            }
        );

        if (user) {
            let company;
            if (user?.hasComplianceError) {
                company = await Company.findOne(
                    { owner: id },
                    { _id: 0, owner: 0, created_at: 0, updated_at: 0 }
                );

                const addressUrl = await AWS.getGetSignedUrl(
                    company?.addressProof
                );
                const docIdUrl = await AWS.getGetSignedUrl(company?.documentId);
                company.addressProof = addressUrl;
                company.documentId = docIdUrl;
            }

            const data = {};
            const { complianceErrors, ...others } = user;
            data.user = others?._doc;
            data.complianceErrors = complianceErrors;
            delete data?.user?.complianceErrors;
            data.company = company;

            return respond(res, data, "Request successful", 201, true);
        }
        return respond(res, null, "User does not exist");
    } catch (error) {
        respond(res, null, error);
    }
};

exports.setComplianceErrors = async (req, res) => {
    const id = req.params.id;
    const body = req.body;

    try {
        const user = await User.findOne({ _id: id });

        if (user) {
            user.hasComplianceError = true;
            user.complianceErrors = body;
            user.hasComplianceApproved = false;
            const docs = await user.save({ validateBeforeSave: false });

            const {
                hasCompliance,
                hasComplianceError,
                hasComplianceApproved,
                is_activated,
                account_email,
                complianceErrors,
            } = docs;
            const data = {
                hasCompliance,
                hasComplianceError,
                hasComplianceApproved,
                is_activated,
                account_email,
                complianceErrors,
            };

            const message = template(docs?.first_name, docs?.complianceErrors);
            await pushEmail({
                email: docs?.account_email,
                subject: "Compliance Error",
                message: message,
                source: "support@vendgram.co",
            });

            return respond(res, data, "Request successful", 201, true);
        }
        return respond(res, null, "User does not exist", 404, false);
    } catch (error) {
        respond(res, null, error.message);
    }
};

exports.approveCompliance = async (req, res) => {
    const PROVIDUS_URL = env.providus_ra_url // Providus reserved account
    const userId = req.params.id;
    const vgEmail = req.body.email
    console.log(vgEmail, req.body)
    res.writeHead(201, { 'Content-Type': 'application/json' });
    try {
        if (!vgEmail) {
            return respond(res, null, 'You need a vendgram email to approve this compliance')
        }
        const user = User.findOne({ _id: userId });
        const company = Company.findOne({ owner: userId })
        const refs = await Promise.all([user, company])
        const userRef = refs[0]
        
        if (!userRef) {
            return respond(res, null, 'User does not exist', 400, false)
        }
        //register user for brex
        const body = {
            first_name: refs[1].first_name,
            last_name: refs[1].last_name,
            email: vgEmail
        };
        const url = `${env.brex_url}/users`;
        delete options.url;
        options.headers.Authorization = `Bearer ${env.brex_token}`;
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
        
        const brexUser = await (await fetch(url, options)).json()
        console.log('brex',brexUser);
        if(brexUser) {
            userRef.brexEmail = brexUser?.email
            userRef.brexId = brexUser?.id;
            userRef.hasComplianceError = false;
            userRef.hasComplianceApproved = true;
        }

        await userRef.save({ validateBeforeSave: false })
        write(res, null, 'Brex user created')

        const compName = refs[1]?.company_name
        const txBody = {account_name: compName, bvn: ""};
        
        const params = {}
        const XAUTHSIGNATURE = env.providus_x_auth;
        const PROVIDUS_CLIENT_ID = env.providus_client_id
        params.headers = {}
        params.headers["Content-Type"] = 'application/json'
        params.headers["X-Auth-Signature"] = XAUTHSIGNATURE
        params.headers["Client-Id"] = PROVIDUS_CLIENT_ID
        params.body = JSON.stringify(txBody)
        params.method = 'POST'

        const racct = await (await fetch(PROVIDUS_URL, params)).json()
        
        if (!racct.requestSuccessful) {
            return respond(res, null, racct.responseMessage, 400, false)
        }
        
        let userSheet = await Sheet.findOne({ owner: userId })
        if (!userSheet) {
            userSheet = await Sheet.create({ 
                owner: userId, 
                account_number: racct?.account_number,
                account_name: racct?.account_name,
                brexId: brexUser?.id
            })
            userRef.account_number = racct?.account_number;
            userRef.account_name = racct?.account_name;
            await userRef.save({ validateBeforeSave: false });
            write(res, null, 'Providus account created')
        }

        const data = {
            hasComplianceApproved: true,
            account_number: doc?.account_number,
            account_name: doc?.account_name,
            balance: userSheet?.balance,
            brexEmail: brexUser?.email,
        }
        const json = JSON.stringify(data)
        return res.end(json)
    } catch (error) {
        respond(res, null, error.message);
    }
};

exports.createBrexAcct = async (req, res) => {
    const userId = req.params.id;
    const vgEmail = req.body.email
    console.log(vgEmail, req.body)
    try {
        if (!vgEmail) {
            return respond(res, null, 'You need a vendgram email to approve this compliance')
        }
        const user = User.findOne({ _id: userId });
        const company = Company.findOne({ owner: userId })
        const refs = await Promise.all([user, company])
        const userRef = refs[0]
        
        if (!userRef) {
            return respond(res, null, 'User does not exist', 400, false)
        }
        //register user for brex
        const body = {
            first_name: refs[1].first_name,
            last_name: refs[1].last_name,
            email: vgEmail
        };
        const url = `${env.brex_url}/users`;
        delete options.url;
        options.headers.Authorization = `Bearer ${env.brex_token}`;
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
        
        const brexUser = await (await fetch(url, options)).json()
        console.log('brex',brexUser);
        userRef.brexEmail = brexUser?.email
        userRef.brexId = brexUser?.id;
        await userRef.save({ validateBeforeSave: false })
        return respond(res, brexUser, 'Brex user created', 201, true)
    } catch (error) {
        respond(res, null, error.message);
    }
}

exports.createReservedAcct = async (req, res) => {
    const PROVIDUS_URL = env.providus_ra_url // Providus reserved account
    const userId = req.params.id;
    try {
        const user = User.findOne({ _id: userId });
        const company = Company.findOne({ owner: userId })
        const refs = await Promise.all([user, company])
        const userRef = refs[0]
        
        if (!userRef) {
            return respond(res, null, 'User does not exist', 400, false)
        }

        const compName = refs[1]?.company_name
        const txBody = {account_name: compName, bvn: ""};
        
        const params = {}
        const XAUTHSIGNATURE = env.providus_x_auth;
        const PROVIDUS_CLIENT_ID = env.providus_client_id
        params.headers = {}
        params.headers["Content-Type"] = 'application/json'
        params.headers["X-Auth-Signature"] = XAUTHSIGNATURE
        params.headers["Client-Id"] = PROVIDUS_CLIENT_ID
        params.body = JSON.stringify(txBody)
        params.method = 'POST'

        const racct = await (await fetch(PROVIDUS_URL, params)).json()
        
        if (!racct.requestSuccessful) {
            return respond(res, null, racct.responseMessage, 400, false)
        }
        
        let userSheet = await Sheet.findOne({ owner: userId })
        if (!userSheet || !userSheet?.account_number) {
            userSheet = await Sheet.create({ 
                owner: userId, 
                account_number: racct?.account_number,
                account_name: racct?.account_name,
                brexId: userRef?.brexId
            })
            userRef.account_number = racct?.account_number;
            userRef.account_name = racct?.account_name;
            await userRef.save({ validateBeforeSave: false });
        }
        return respond(res, null, 'Providus Account created successfully', 201, true)
    } catch (error) {
        respond(res, null, error.message);
    }
}

exports.updateBrexUser = async (req, res) => {
    const userId = req.params.id;
    const { status } = req.body
    try {
        const user = User.findOne({ _id: userId });
        const company = Company.findOne({ owner: userId })
        const refs = await Promise.all([user, company])
        const userRef = refs[0]
        
        if (!userRef) {
            return respond(res, null, 'User does not exist', 400, false)
        }
        //register user for brex
        const body = {
            status,
        };
        const url = `${env.brex_url}/users/${userRef.brexId}`;
        delete options.url;
        options.headers.Authorization = `Bearer ${env.brex_token}`;
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
        options.method = 'PUT'
        
        const brexUser = await (await fetch(url, options)).json()
        console.log('brex',brexUser);
        userRef.hasComplianceApproved = true;
        userRef.hasComplianceError = false;
        await userRef.save({ validateBeforeSave: false })
        return respond(res, null, 'Brex user activated', 201, true)
    } catch (error) {
        respond(res, null, error.message);
    }
}


exports.setRate = async (req, res) => {
    try {
        let rates
        const RT = { USD: 'USD', GBP: 'GBP', EURO: 'EURO' }
        const type = req.params.type.toUpperCase()
        const { rate, charge, fee } = req.body
        // console.log(req.body)
        if (!rate && RT[type]) {
            return respond(res, null, 'Rate can not be null', 400)
        }

        const rateExist = await Rate.findOne({type})
        if (rateExist) {
            const newcharge = charge/100
            const update = {
                rate,
                charge: newcharge,
                fee
            }
            rates = await Rate.findOneAndUpdate({type}, update, {new: true})
            return respond(res, rates, 'Request successful', 201, true)
        }
    
        rates = await Rate.create({type, rate, charge})
        respond(res, rates, 'Request successful', 200, true)

    } catch(err) {
        console.log(err);
        respond(res, null, err.message)
    }
}

exports.getRate = async (req, res) => {
    try {
        const rates = await Rate.findOne({ type:'USD' })
        respond(res, rates, 'Request successful', 200, true)

    } catch(err) {
        respond(res, null, err.message)
    }
}


exports.getAllTransactions = async (req, res) => {
    try {
        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const url = `${BREX_URL}/transactions/card/primary`
        
        const brxTxns = await (await fetch(url, params)).json()

        const txns = brxTxns.items.filter(txn => txn.type === 'PURCHASE' || txn.type === 'REFUND')
        respond(res, txns, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};


exports.getUserTransactions = async (req, res) => {
    const owner = req.params.id
    try {

        const userCards = await Card.find({ owner: owner })
        if (!userCards.length) return respond(res, null, 'No cards for this user', 204, true)

        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const url = `${BREX_URL}/transactions/card/primary`
        
        const brxTxns = await (await fetch(url, params)).json()

        const txns = brxTxns.items.filter(txn => txn.type === 'PURCHASE' || txn.type === 'REFUND')
        //Find all the cards transactionsn for a particular user
        const map = new Map(userCards.map(item => [item.card_id, item]));
        const userTxns = txns.filter(txn => map.has(txn.card_id));
        respond(res, userTxns, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};


exports.getCardTransactions = async (req, res) => {
    const cardId = req.params.id
    try {
        const card = await Card.findOne({ _id: cardId })
        if (!card) return respond(res, null, 'Cards does not exist', 204, true)

        const BREX_URL = env.brex_url
        const params = {}
        params.headers = options.headers
        params.headers.Authorization = `Bearer ${env.brex_token}`;
        params.headers["Content-Type"] = "application/json";
        params.method = "GET"
        const url = `${BREX_URL}/transactions/card/primary`
        
        const brxTxns = await (await fetch(url, params)).json()

        const txns = brxTxns.items.filter(txn => txn.type === 'PURCHASE' || txn.type === 'REFUND')
        const cardTxns = txns.filter(txn => txn.card_id === card.card_id)
        respond(res, cardTxns, 'Success', 201, true)
    } catch (err) {
        respond(res, null, err.message, err.status)
    }
};


exports.getTotalUsers = async (req, res) => {
    try {
        const users = await User.find()
        const activeUsers = await User.find({ hasComplianceApproved: true })
        const data = {
            totalUsers: users?.length,
            totalActiveUsers: activeUsers?.length
        }
        // console.log(data)
        return respond(res, data, 'success', 201, true)
    } catch (error) {
        return respond(res, null, error.message)
    }
}