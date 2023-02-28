exports.configOptions = {
    method: "POST",
    url: "",
    headers: {
        "Content-Type": ["application/json", "application/json"],
    },
    body: "",
};

exports.pushEmailOptions = {
    email: "",
    subject: "",
    message: "",
    source: "vendgram@vendgram.co",
};

exports.APP_URL = "https://app.vendgram.co/";

exports.projectUser = {
    _id: 0,
    emailVerificationToken: 0,
    created_at: 0,
    updated_at: 0,
    emailVerificationDate: 0,
    brexEmail: 0,
};

exports.projectCompany = {
    _id: 0,
    owner: 0,
    stakeOwned: 0,
    mediaAwareness: 0,
    isIncorporated: 0,
    usRegistered: 0,
    utilityAmount: 0,
    ein: 0,
    businessAddress: 0,
    addressProof: 0,
    documentId: 0,
    timestamps: 0,
};


exports.FEE_PERCENT = 0.025; //2.5% 
exports.FLAT_FEE_USD = 1.00;//$1 USD
