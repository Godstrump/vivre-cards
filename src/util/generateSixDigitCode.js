function generateSixDigitCode() {
    const result = Math.floor(100000 + Math.random() * 900000);
    return `${result}`
}

module.exports = generateSixDigitCode;
  