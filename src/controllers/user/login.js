const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const respond = require("../../util/sendResponse");
const Company = require("../../models/company.model");
// const projectCompany = require("../../util/constants").projectCompany;
const Sheet = require("../../models/sheet.model")
const env = require("../../config/config")
// const options = require("../../util/constants").configOptions
const fetch = require("../../util/fetch")
const convertToBrxAmount = require("../../util/convertToBrexAmount")
const generateJWToken =  require("../../util/generateJwtToken")
const generateOtp = require("../../util/generateSixDigitCode")
const otpTemplate = require("../../templates/otpTemplate")
const pushEmail = require("../../util/awsSendEmail")
const AWS = require("../../config/aws")

exports.userLogout = async (req, res) => {
    try {
        res.cookie("token", "none", { expires: new Date(Date.now() + 10000) });
        res.status(200).send({
            status: true,
            message: "Logged out successfully",
            data: {},
        });
    } catch (err) {
        next(err);
    }
};

exports.sendOtp = async (req, res) => {
    const { email, password } = req.body;
    // simple validation
    if (!email || !password) {
        return respond(res, null, "Please enter email and password");
    }
    try {
        const user = await User.findOne({
            account_email: email.toLowerCase(),
        }).select("+account_password");
        if (!user) {
            return respond(res, null, "User does not exist", 404);
        }
        if (!user.is_activated) {
            return respond(res, null, "User account is not activated yet");
        }
        const isMatch = await bcrypt.compare(password, user.account_password);

        if (!isMatch) {
            return respond(res, null, "Invalid credentials");
        }

        if ((isMatch, user)) {
            let data;
            // create a jwt token
            const currentTime = Math.floor(Date.now() / 1000);
            const expiryTime = currentTime + (5 * 60);
            const token = generateJWToken(user._id, user.account_email, expiryTime)

            const otp = generateOtp()
            user.otp = otp

            data = {
                token,
            };

            const message = otpTemplate(otp)
            await pushEmail({
                email: user.account_email,
                subject: "Vendgram ",
                message: message,
                source: "support@vendgram.co",
            });
            await user.save({ validateBeforeSave: false })
            const msg = "Otp generated";
            respond(res, data, msg, 201, true);
        }
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;
    //refresh token
    const rT = req.refreshToken
    // simple validation
    if (!email || !password) {
        return respond(res, null, "Please enter email and password");
    }
    try {
        const user = await User.findOne({
            account_email: email.toLowerCase(),
        }).select("+account_password +token");
        if (!user) {
            return respond(res, null, "User does not exist", 404);
        }
        if (!user.is_activated) {
            return respond(res, null, "User account is not activated yet");
        }
        const isMatch = await bcrypt.compare(password, user.account_password);
        
        if (!isMatch) {
            return respond(res, null, "Invalid credentials");
        }
        
        if ((isMatch, user)) {
            let data;
            let brexLimit;
            
            const sheet = await Sheet.findOne({ owner: user._id })
            const company = await Company.findOne({ owner: user._id });
            if (sheet && user?.hasComplianceApproved, company) {
                const BREX_URL = env.brex_url
                const body = {
                    amount: convertToBrxAmount(`${sheet.balance}00`),
                    currency: "USD"
                }
                const params = {}
                params.headers = {}
                params.headers.Authorization = `Bearer ${env.brex_token}`;
                params.headers["Content-Type"] = "application/json";
                // params.headers["Idempotency-Key"] = sheet.balance;
                params.body = JSON.stringify(body);
                params.method = "POST";
                const url = `${BREX_URL}/users/${user?.brexId}/limit`
                
                brexLimit = await (await fetch(url, params)).json()
                
                const addressUrl = await AWS.getGetSignedUrl(company?.addressProof);
                const docIdUrl = await AWS.getGetSignedUrl(company?.documentId);
                company.addressProof = addressUrl;
                company.documentId = docIdUrl
            }
            console.log(sheet)
            // create a jwt token
            const currentTime = Math.floor(Date.now() / 1000);
            const expiryTime = currentTime + (24 * 60 * 60);
            const token = generateJWToken(user._id, user.account_email)
            if (!rT) refreshToken = generateJWToken(user._id, user.account_email, expiryTime, env.refresh_secret)
            else refreshToken = rT

            user.token = token
            await user.save()
            console.log(user);
            data = {
                email: user?.account_email,
                hasCompliance: user?.hasCompliance,
                hasComplianceApproved: user?.hasComplianceApproved,
                hasComplianceError: user?.hasComplianceError,
                bankDetails: sheet,
                _doc: company,
                refreshToken,
                token,
            };

            const msg = "User logged in successfully";
            respond(res, data, msg, 201, true);
        }
    } catch (err) {
        respond(res, null, err.message, 500);
    }
    // const { otp } = req.body;
    // const user = req.user;
    // //refresh token
    // const rT = req.refreshToken
    // try {
    //     if (!otp) {
    //         return respond(res, null, 'Otp can not be null')
    //     }
    //     const isOtp = await User.findOne({
    //         otp: otp,
    //     }).select("+otp");

    //     if (isOtp) {
    //         let data;
    //         let brexLimit;
    //         let refreshToken;

    //         const sheet = await Sheet.findOne({ owner: user._id })
    //         if (sheet && user.hasComplianceApproved) {
    //             const BREX_URL = env.brex_url
    //             const body = {
    //                 amount: convertToBrxAmount(`${sheet.balance}00`),
    //                 currency: "USD"
    //             }
    //             const params = {}
    //             params.headers = {}
    //             params.headers.Authorization = `Bearer ${env.brex_token}`;
    //             params.headers["Content-Type"] = "application/json";
    //             // params.headers["Idempotency-Key"] = sheet.balance;
    //             params.body = JSON.stringify(body);
    //             params.method = "POST";
    //             const url = `${BREX_URL}/users/${user?.brexId}/limit`
                
    //             brexLimit = await (await fetch(url, params)).json()
    //         }
    //         // create a jwt token
    //         const currentTime = Math.floor(Date.now() / 1000);
    //         const expiryTime = currentTime + (24 * 60 * 60);
    //         const token = generateJWToken(user._id, user.account_email)
    //         if (!rT) refreshToken = generateJWToken(user._id, user.account_email, expiryTime, env.refresh_secret)
    //         else refreshToken = rT

    //         const company = await Company.findOne(
    //             { owner: user._id }
    //         );

    //         data = {
    //             email: user?.account_email,
    //             hasCompliance: user?.hasCompliance,
    //             hasComplianceApproved: user?.hasComplianceApproved,
    //             hasComplianceError: user?.hasComplianceError,
    //             bankDetails: sheet,
    //             _doc: company,
    //             token,
    //             refreshToken
    //         };

    //         isOtp.otp = ''
    //         await isOtp.save({ validateBeforeSave: false })

    //         const msg = "User logged in successfully";
    //         respond(res, data, msg, 201, true);
    //     }
    // } catch (err) {
    //     respond(res, null, err.message, 500);
    // }
};


exports.getRefreshToken = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) return respond(res, null, 'Token can not be null', 401)
    const token = req.headers["x-access-token"];

    jwt.verify(refreshToken, env.refresh_secret, async (err, user) => {
        if (err) return respond(res, null, err.message, 403);
        const owner = await User.findOne({ _id: user._id }).select("+token")
        if (!owner) return respond(res, null, 'User does not exist')
        if (token != owner.token) return respond(res, null, "Unauthorized", 401)
        const currentTime = Math.floor(Date.now() / 1000);
        const expiryTime = currentTime + (24 * 60 * 60);
        const accessToken = generateJWToken(user._id, user.account_email, expiryTime, env.refresh_secret);
        respond(res, accessToken, 'Success', 201, true);
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    // simple validation
    if (!email || !password) {
        return respond(res, null, "Please enter email and password");
    }
    try {
        const user = await User.findOne({
            account_email: email.toLowerCase(),
        }).select("+account_password");
        if (!user) {
            return respond(res, null, "User does not exist", 404);
        }
        if (!user.is_activated) {
            return respond(res, null, "User account is not activated yet");
        }
        const isMatch = await bcrypt.compare(password, user.account_password);

        if (!isMatch) {
            return respond(res, null, "Invalid credentials");
        }

        if ((isMatch, user)) {
            let data;
            let brexLimit;

            const sheet = await Sheet.findOne({ owner: user._id })
            if (sheet && user.hasComplianceApproved) {
                const BREX_URL = env.brex_url
                const body = {
                    amount: convertToBrxAmount(`${sheet.balance}00`),
                    currency: "USD"
                }
                const params = {}
                params.headers = {}
                params.headers.Authorization = `Bearer ${env.brex_token}`;
                params.headers["Content-Type"] = "application/json";
                // params.headers["Idempotency-Key"] = sheet.balance;
                params.body = JSON.stringify(body);
                params.method = "POST";
                const url = `${BREX_URL}/users/${user?.brexId}/limit`
                
               brexLimit = await (await fetch(url, params)).json()
            }
            // create a jwt token
            const token = generateJWToken(user._id, user.account_email)

            const company = await Company.findOne(
                { owner: user._id }
            );

            console.log(user, company);
            data = {
                email: user?.account_email,
                hasCompliance: user?.hasCompliance,
                hasComplianceApproved: user?.hasComplianceApproved,
                hasComplianceError: user?.hasComplianceError,
                bankDetails: sheet,
                _doc: company,
                token,
            };

            const msg = "User logged in successfully";
            respond(res, data, msg, 201, true);
        }
    } catch (err) {
        respond(res, null, err.message, 500);
    }
};