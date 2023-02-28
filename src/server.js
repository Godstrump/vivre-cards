const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/dB");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const path = require("path");
const indexRoute = require("./routes/");
const { stopCronJob, cronJob } = require("./util/cron-scheduler")

dotenv.config({ path: "./.env" });

const app = express();

// MIDDLEWARES
// Allow CORS
app.use(cors());

// Body limit is 10
app.use(express.json({ limit: "10mb", extended: true }));
app.use(
    express.urlencoded({
        limit: "10mb",
        extended: true,
    })
);
// Sanitize data to prevent noSQL Injection Attack
app.use(mongoSanitize());

// Set security headers to prevent XSS Attack
app.use(helmet());

// Sanitize data to prevent XSS Attack
app.use(xss());

// Rate Limiting (max of 100 request per 10min) to prevent DDoS attack
const limiter = rateLimit({
    max: 100,
    windowMs: 10 * 60 * 1000,
});
app.use(limiter);

// Prevent HTTP param polution
app.use(hpp());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Set response headers
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Mount Index Route
app.use("/api", indexRoute);

// Not found route
app.use("**", (req, res) => {
    res.status(404).send({ message: "Route not found" });
});

// Initialize DB connection
connectDB(() => {
    //Initialise scheduler after db
    cronJob.start()
});

process.on('SIGINT', stopCronJob);
process.on('exit', stopCronJob);
process.on('SIGTERM ', stopCronJob);

const port = process.env.PORT || 5001;

app.listen(port, () => console.log(`Server connected on ${port}`));
