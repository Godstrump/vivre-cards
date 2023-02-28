const generateFilename = (filename) => {
    const imgtype = imgType.split("/");
    const arr = filename.split(imgtype[1]);
    arr.splice(0, 1, `${id}/${docType}/${arr[0]}`);
    const name = arr.join(imgtype[1]);
    return name;
};

module.exports = generateFilename;
