// generate account number
exports.generateAccountNumber = () => {
    const bankId = "500";
    const generatedSeven = String(getRandom(7));
    const accountNumber = bankId + generatedSeven;
    const accountNumberLength = 10;

    if (accountNumber.length === accountNumberLength) {
        return {
            status: 'success',
            message: 'account number has been generated successfully!',
            account_number: accountNumber
        };
    } else {
        return {
            status: 'the account generated already exists!',
            message: 'run the create account function again'
        };
    }
};


// generate random number
function getRandom(length) {
    return Math.floor(
        Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
    );
}

