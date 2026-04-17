const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now,
        expires: 5*60,
    }
});

async function sendVerificationOTP(email, otp) {
    try {
        const mailResponse = await mailSender(email,
			"Verification Email",
			emailTemplate(otp))
        console.log("Email sent Successfully: ", mailResponse.response);
        return mailResponse
    } catch (error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}

OTPSchema.pre("save", async function (next) {
    try {
        await sendVerificationOTP(this.email, this.otp);
        next();
    } catch (error) {
        next(error);
    }
}) 

module.exports = mongoose.model("OTP", OTPSchema);