const paginateUtilities = (data, pageSize = 12, pageNumber = 1) => {
    const skips = +pageSize * (+pageNumber - 1);
    // console.log(data);

    return data.skip(skips).limit(+pageSize).exec();
};

module.exports = paginateUtilities;
