const isFalsy = (value) => {
    if (value?.trim() === "" || value === undefined || value === null) {
        return true;
    }
    return false;
};

module.exports = isFalsy;
