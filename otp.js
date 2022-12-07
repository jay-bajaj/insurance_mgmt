const otpGenerator = require('otp-generator');

module.exports.otpGenerator = ()=> {
    const OTP = otpGenerator.generate(6,{ upperCaseAlphabets: false, specialChars: false });
    return OTP;
}