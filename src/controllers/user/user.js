const User = require("../../models/user.model");
// const ObjectId = require("mongodb").ObjectId;
const isFalsy = require("../../util/isFalsy");
const respond = require("../../util/sendResponse");
const Company = require("../../models/company.model");
const countries = require("../../data/countries.json");
const banks = require("../../data/banks.json")
const sectors = require("../../data/sectors.json");
const AWS = require("../../config/aws");
const generateFilename = require("../../util/generateFilename");
const pushEmail = require("../../util/awsSendEmail");
const template = require("../../templates/complianceTemplate");
const complianceUpdateTemplate =
    require("../../templates/complianceErrorTemplate").complianceErrorUpdate;
const _ = require("lodash");
const Bank = require("../../models/bankDetails.model")

exports.userUser = async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        return res.status(400).send({
            status: false,
            message: "You do not have right to access this data",
        });
    }
    try {
        const data = await User.findById(req.user._id);
        res.status(200).send({ status: true, data });
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.completeCompliance = async (req, res) => {
    try {
        // console.log(req.user);
        let msg;
        const userID = req.user?._id;
        const files = req.files;
        const filter = { _id: userID };
        const user = await User.findOne(filter);

        //Check if the user compliance is completed
        if (user?.hasCompliance) {
            msg = `Profile has been completed already`;
            return respond(res, null, msg);
        }

        if (user?.hasComplianceApproved) {
            msg = `Profile has already been approved`;
            return respond(res, null, msg);
        }

        //fields that are null and Empty
        let invalidField;
        //Select the required fields
        const {
            stakeOwned,
            mediaAwareness,
            isIncorporated,
            usRegisted,
            utilityAmount,
            ...requiredFields
        } = req.body;

        //Check if any of the required fields are empty or falsy
        Object.entries(requiredFields).some(([key, value]) => {
            if (isFalsy(value)) {
                invalidField = key;
            }
        });
        //End and return the empty field
        if (invalidField) {
            msg = `${invalidField} can not be empty`;
            return respond(res, null, msg);
        }

        if (_.isEmpty(files)) {
            msg = `Please upload the required files`;
            return respond(res, null, msg);
        }

        const addressFile = files.addressProof[0];
        const docIdFile = files.documentId[0];

        console.log(docIdFile, addressFile);

        //Attach user id to the file name which will be used as the aws s3 key and filename
        const addressFilename = generateFilename(
            "address",
            addressFile.filename,
            addressFile.mimetype,
            userID
        );
        const docIdFilename = generateFilename(
            "documentId",
            docIdFile.filename,
            docIdFile.mimetype,
            userID
        );

        console.log(addressFilename, docIdFilename);

        //create a company schema
        const newCompany = new Company({
            owner: userID,
            stakeOwned,
            mediaAwareness,
            isIncorporated,
            usRegisted,
            utilityAmount,
            addressProof: addressFilename,
            documentId: docIdFilename,
            ...requiredFields,
        });

        //select the fields to update the user profile with.
        const { first_name, last_name, phone_number } = requiredFields;
        const updateData = {
            hasCompliance: true,
            first_name,
            last_name,
            phone_number,
        };

        //save the company
        const company = newCompany.save();
        //update the user
        const updateUser = User.findOneAndUpdate(filter, updateData, {
            new: true,
        });
        // Save the file on AWS and save it on the returning variable
        const addressAwsUpload = AWS.getPutSignedUrl(
            addressFile.path,
            addressFilename
        );
        const docIdAwsUpload = AWS.getPutSignedUrl(
            docIdFile.path,
            docIdFilename
        );
        //Initiate a combination of the two processes so if one fails none will be saved
        const doc = await Promise.all([
            company,
            updateUser,
            addressAwsUpload,
            docIdAwsUpload,
        ]);

        if (doc) {
            const message = template(doc[0].last_name);
            await pushEmail({
                email: doc[1]?.account_email,
                subject: "Welcome to Vendgram",
                message: message,
                source: "vendgram@vendgram.co",
            });

            const data = {
                first_name,
                last_name,
                phone_number,
                email: doc[1].account_email,
            };
            msg = "Profile created successfully";
            return respond(res, data, msg, 200, true);
        }
        msg = "Profile creation was unsuccessful";
        return respond(res, doc, msg);
    } catch (error) {
        respond(res, null, error.message);
    }
};

exports.getCountries = async (req, res) => {
    respond(res, countries, "Success", 201, true);
};

exports.getSectors = async (req, res) => {
    respond(res, sectors, "Success", 201, true);
};

exports.getBanks = async (req, res) => {
    respond(res, banks, "Sucvess", 201, true)
}

exports.getComplianceErrors = async (req, res) => {
    const id = req.user._id;

    try {
        const user = await User.findOne(
            { _id: id },
            {
                _id: 0,
                emailVerificationToken: 0,
                created_at: 0,
                updated_at: 0,
                emailVerificationDate: 0,
                brexEmail: 0,
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

exports.getUserCompliance = async (req, res) => {
    const id = req.user._id;

    try {
        const company = await Company.findOne(
            { owner: id },
            { _id: 0, owner: 0, created_at: 0, updated_at: 0 }
        );

        if (company) {
            const addressUrl = AWS.getGetSignedUrl(company?.addressProof);
            const docIdUrl = AWS.getGetSignedUrl(company?.documentId);

            const data = {};

            company.addressProof = addressUrl;
            company.documentId = docIdUrl;

            data.company = company;

            return respond(res, data, "Request successful", 201, true);
        }
        return respond(res, null, "User does not exist");
    } catch (error) {
        respond(res, null, error);
    }
};

exports.updateUserCompliance = async (req, res) => {
    try {
        let msg;
        const userID = req.user._id;
        const files = req?.files;
        const query = { _id: userID };
        const user = await User.findOne(query);

        console.log("file", files);

        //Select the compliance error fields
        const errorFields = user?.complianceErrors;
        //Select the required fields
        const requiredFields = req.body;

        if (user?.hasComplianceApproved) {
            msg = `Compliance profile for ${user?.first_name} has been approved`;
            return respond(res, null, msg);
        }

        //Check if the user compliance is completed
        if (user?.hasCompliance && !user?.hasComplianceError) {
            msg = `Profile has been completed and awaiting review`;
            return respond(res, null, msg);
        }

        //Fields that are invalid or empty
        let invalidField;
        let falseField;

        //Check if any of the required fields are empty, falsy or invalid
        Object.entries(requiredFields).some(([key, value]) => {
            if (!errorFields[key]) {
                invalidField = key;
                return;
            }
            if (isFalsy(value)) {
                falseField = key;
            }
        });

        //End and return the empty field
        if (invalidField) {
            msg = `${invalidField} is not part of the compliance errors`;
            return respond(res, null, msg);
        }

        if (falseField) {
            msg = `${falseField} can not be empty`;
            return respond(res, null, msg);
        }

        //create variables for documents and addressproof
        let docIdFile = undefined;
        let addressFile = undefined;

        let docIdFilename = undefined;
        let addressFilename = undefined;

        //Check if documentId is part of the compliance error
        if (files["documentId"]) {
            docIdFile = files.documentId[0];
            //Attach user id to the file name which will be used as the aws s3 key and filename
            docIdFilename = generateFilename(
                "documentId",
                docIdFile.filename,
                docIdFile.mimetype,
                userID
            );
            requiredFields.documentId = docIdFilename;
        }

        // Check if addressProof if part of the compliance error
        if (files["addressProof"]) {
            addressFile = files.addressProof[0];
            //Attach user id to the file name which will be used as the aws s3 key and filename
            addressFilename = generateFilename(
                "address",
                addressFile.filename,
                addressFile.mimetype,
                userID
            );

            requiredFields.addressProof = addressFilename;
        }

        let addressAwsUpload;
        let docIdAwsUpload;

        //Check which fields are going to be updated to the user doc
        const updateData = {};
        if (requiredFields["first_name"]) {
            updateData.first_name = requiredFields["first_name"];
        }

        if (requiredFields["last_name"]) {
            updateData.last_name = requiredFields["last_name"];
        }

        if (requiredFields["phone_number"]) {
            updateData.phone_number = requiredFields["phone_number"];
        }

        console.log("rf", requiredFields);

        //find the user company and update
        const company = Company.findOneAndUpdate(
            { owner: userID },
            requiredFields,
            { new: true }
        );
        //update the user
        const updateUser = User.findOneAndUpdate(query, updateData, {
            new: true,
        });

        //Is Address upload part of the upload if yes upload to aws
        if (addressFile) {
            // Save the file on AWS and save it on the returning variable
            addressAwsUpload = AWS.getPutSignedUrl(
                addressFile.path,
                addressFilename
            );
        }

        //Is documentId part of the uoload if yes upload to aws
        if (docIdFile) {
            //Save the file on AWS and save it on the returning variable
            docIdAwsUpload = AWS.getPutSignedUrl(docIdFile.path, docIdFilename);
        }

        //Initiate a combination of the two processes so if one fails none will be saved
        const doc = await Promise.all([
            company,
            updateUser,
            addressAwsUpload,
            docIdAwsUpload,
        ]);

        if (doc) {
            console.log(doc);
            const message = complianceUpdateTemplate(doc[0]?.last_name);
            await pushEmail({
                email: user?.account_email,
                subject: "Compliance Update",
                message: message,
                source: "support@vendgram.co",
            });

            const data = {
                email: doc[1].account_email,
            };
            msg = "Profile update successfully";
            return respond(res, data, msg, 201, true);
        }
        msg = "Profile update was unsuccessful";
        return respond(res, doc, msg);
    } catch (error) {
        respond(res, null, error.message);
    }
};

exports.addBankAcct = async (req, res) => {
    const body = req.body;
    const userId = req.user._id;
    body.owner = userId;

    try {
        const accts = await Bank.create(body);
        respond(res, accts, 'Success', 200, true)
    } catch (error) {
        respond(res, null, error.message, 500)
    }
}

exports.getBankDetails = async (req, res) => {
    try {
        const userId = req.user._id
        const bankAccts = await Bank.find({ owner: userId })
        respond(res, bankAccts, 'success', 201, true)
    } catch (error) {
        respond(res, null, error.message)
    }
}

exports.deleteBankDetails = async (req, res) => {
    try {
        const bankId = req.params.id
        const userId = req.user._id;
        const acct = await Bank.deleteOne({ _id: bankId, owner: userId })
        if (acct.deletedCount !== 1) return respond(res, null, 'Account not found')
        respond(res, null, 'User deleted successfully')
    } catch (error) {
        respond(res, null, error.message)
    }
}
