const Razorpay = require ('razorpay')

let instance = null;

try {
    if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
        instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        })
    } else {
        console.warn("Razorpay not configured (missing RAZORPAY_KEY/RAZORPAY_SECRET)");
    }
} catch (e) {
    console.error("Failed to initialize Razorpay instance", e);
}

exports.instance = instance;