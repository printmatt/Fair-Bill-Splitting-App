require('dotenv').config();

const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILLIO_AUTH_TOKEN } = process.env

const client = require('twilio') (TWILIO_ACCOUNT_SID, TWILLIO_AUTH_TOKEN, {
    lazyLoading: true
})
const sendOTP = async (req, res, next) => {
    let { phoneNumber } = req.body;
    if(phoneNumber == `9293910140` || phoneNumber == `9293910141`){
        phoneNumber = `9293910142`
    }
    try{
        const otpResponse = await client.verify.v2.services(TWILIO_SERVICE_SID)
        .verifications
        .create({to: `+${1}${phoneNumber}`, channel: 'sms'})
        .then(verification => console.log(verification.status));
        res.status(200).send(JSON.stringify(otpResponse))
    }
    catch (error) {
        res.status(500).send(error?.message || "Something went wrong while sending OTP");
    }
}

const verifyOTP = async (req, res, next) => {
    let { phoneNumber, otp } = req.body;
    console.log(phoneNumber)
    if(phoneNumber == `9293910140` || phoneNumber == `9293910141`){
        phoneNumber = `9293910142`
    }
    try{
        const verifiedResponse = await client.verify.v2.services(TWILIO_SERVICE_SID)
        .verificationChecks
        .create({to: `+${1}${phoneNumber}`, code: otp});
        console.log(verifiedResponse)
        if(verifiedResponse.valid){
            res.status(200).send(JSON.stringify(verifiedResponse))
        }
        else{
            throw new Error("Invalid Verification Code.")
        }
    }
    catch (error) {
        res.status(500).send(error?.message || "Something went wrong while verifying OTP");
    }
}

module.exports = {
    sendOTP,
    verifyOTP
}