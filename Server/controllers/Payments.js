const {instance} = require('../config/razorpay');
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress")

const normalizeCourseIds = (courses) => {
    if (!Array.isArray(courses)) return [];

    return [...new Set(courses
        .map((id) => String(id || "").trim())
        .filter(Boolean))];
};

exports.capturePayment = async (req, res) => {
    if (!instance) {
        return res.status(500).json({
            success: false,
            message: "Razorpay is not configured on the server",
        });
    }

    const userId = req.user?.id;
    const courses = normalizeCourseIds(req.body?.courses);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (courses.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Provide at least one valid courseId",
        })
    }

    let totalAmount = 0;

    for (const courseId of courses) {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid courseId",
            });
        }

        let course;
        try {
            course = await Course.findById(courseId);

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course doesn't exist",
                })
            }

            const alreadyEnrolled = (course.studentsEnrolled || []).some(
                (studentId) => studentId?.toString() === userId.toString()
            );

            if (alreadyEnrolled) {
                return res.status(409).json({
                    success: false,
                    message: "User already registered",
                })
            }

            const coursePrice = Number(course.price);
            if (!Number.isFinite(coursePrice) || coursePrice <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid course price",
                });
            }

            totalAmount += coursePrice;
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }
    
    console.log("The amount in capturePayment is", totalAmount)
    const currency = "INR"
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        // Attach metadata so the webhook fallback can enroll without relying on the client
        notes: {
            courses: Array.isArray(courses) ? courses.join(",") : "",
            userId: userId,
        },
    }

    try {
        const paymentResponse = await instance.orders.create(options)
        res.json({
            success:true,
            message: paymentResponse
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Could not Initiate Order"});
    }
}

exports.verifyPayment = async (req,res) => {
    if (!instance) {
        return res.status(500).json({
            success: false,
            message: "Razorpay is not configured on the server",
        });
    }

    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = normalizeCourseIds(req.body?.courses);
    const userId = req.user?.id;

    if (!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !userId ||
        courses.length === 0) {
            return res.status(400).json({success:false, message:"Payment payload is incomplete"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
                                    .update(body.toString())
                                    .digest("hex")

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({success:false, message:"Payment signature verification failed"});
    }

    try {
        await enrollStudents(courses, userId);
        return res.status(200).json({success:true, message:"Payment Verified"});
    } catch (error) {
        console.log("verifyPayment enroll error", error);
        return res.status(500).json({success:false, message:error.message || "Enrollment failed"});
    }
}

const enrollStudents = async (courses, userId) => {
    if (!courses || !userId) {
        throw new Error("Please Provide data for Courses or UserId");
    }

    for (const courseId of courses) {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            throw new Error("Invalid courseId");
        }

        const updatedCourse = await Course.findByIdAndUpdate(courseId,
            {
                $addToSet: {
                    studentsEnrolled: userId
                }
            }, {new:true});

        if (!updatedCourse) {
            throw new Error("Course not Found");
        }

        const courseProgress = await CourseProgress.findOneAndUpdate(
            { courseID: courseId, userId: userId },
            {
                $setOnInsert: {
                    courseID: courseId,
                    userId: userId,
                    completedVideos: [],
                }
            },
            { new: true, upsert: true }
        );

        const updatedStudent = await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    courses: courseId,
                    courseProgress: courseProgress._id,
                }
            },
            {new: true}
        ).select("email firstName");

        if (updatedStudent?.email) {
            await mailSender(
                updatedStudent.email,
                `Successfully Enrolled into ${updatedCourse.courseName}`,
                courseEnrollmentEmail(updatedCourse.courseName, `${updatedStudent.firstName}`)
            );
        }
    }
}

exports.sendPaymentSuccessEmail = async (req,res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({success:false, message:"User not found"});
        }

        await mailSender(
            user.email,
            `Payment Received`,
            paymentSuccessEmail(`${user.firstName}`,
             amount/100,orderId, paymentId)
        )

        return res.status(200).json({
            success: true,
            message: "Payment success email sent",
        });
    } catch (error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}

// ─── RAZORPAY WEBHOOK (Server-side payment verification) ──────────────────
exports.razorpayWebhook = async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_SECRET;
    
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
        return res.status(400).json({ success: false, message: "Missing signature" });
    }

    try {
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("Webhook signature mismatch");
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === "payment.captured") {
            const payment = payload.payment.entity;
            const notes = payment.notes;

            if (notes && notes.courses && notes.userId) {
                const courseIds = notes.courses.split(",");
                const userId = notes.userId;

                for (const courseId of courseIds) {
                    const course = await Course.findById(courseId);
                    if (!course) continue;

                    const alreadyEnrolled = (course.studentsEnrolled || []).some(
                        (studentId) => studentId?.toString() === userId.toString()
                    );

                    if (alreadyEnrolled) continue;

                    await Course.findByIdAndUpdate(courseId, {
                        $addToSet: { studentsEnrolled: userId },
                    });

                    await CourseProgress.findOneAndUpdate(
                        { courseID: courseId, userId: userId },
                        { courseID: courseId, userId: userId, completedVideos: [] },
                        { upsert: true, new: true }
                    );

                    await User.findByIdAndUpdate(userId, {
                        $addToSet: { courses: courseId },
                    });
                }

                console.log(`Webhook: Enrolled user ${userId} in courses ${notes.courses}`);
            }
        }

        return res.status(200).json({ success: true, message: "Webhook processed" });
    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(200).json({ success: true, message: "Webhook received" });
    }
};