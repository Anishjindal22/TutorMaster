const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
	process.env.FRONTEND_URL,
	process.env.CLIENT_URL,
	"http://localhost:3000",
	"http://127.0.0.1:3000",
	"http://localhost:5173",
	"http://127.0.0.1:5173",
].filter(Boolean);

database.connectDB(); 
app.use(express.json());
app.use(cookieParser());
app.use(
	cors({
		origin: function (origin, callback) {
			const isLocalOrigin =
				typeof origin === "string" &&
				/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

			if (
				!origin ||
				isLocalOrigin ||
				allowedOrigins.length === 0 ||
				allowedOrigins.includes(origin)
			) {
				return callback(null, true);
			}

			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
)
app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)
cloudinaryConnect();

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Backward compatible routes for older frontend builds.
app.use("/auth", userRoutes);
app.use("/profile", profileRoutes);
app.use("/course", courseRoutes);
app.use("/payment", paymentRoutes);

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`App is running at ${PORT}`)
});

