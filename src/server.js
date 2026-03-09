const express = require("express");
const session = require("express-session");
const rateLimit = require("express-rate-limit");

const cors = require("cors");
const csrf = require("csurf");
const helmet = require("helmet");

const multer = require("multer");
const cookieParser = require("cookie-parser");

const path = require("path");
const { fork } = require("child_process");

const { pool, redisStore, env, initializationPool } = require("./utils/storage.js");

const { authRouter } = require("./routes/auth.js");
const { shopRouter } = require("./routes/shop.js");
const { webhookRouter } = require("./routes/webhook.js");
const { profileRouter } = require("./routes/profile.js");
const { settingsRouter } = require("./routes/settings.js");

const app = express();
const upload = multer();

const limiter = rateLimit({
    windowMs: 1000 * 60 * 1,
    max: 5,
    keyGenerator: (req, res) => `${req.headers["x-forwarded-for"] || req.socket.remoteAddress}-${req.path}`,
    handler: (req, res) => res.status(429).send("Слишком много запросов. Попробуйте позже")
});

app.use(cors());
app.use(helmet());

app.use(cookieParser());
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

if (Number(env.TRUST_PROXY) > 0)
    app.set("trust proxy", Number(env.TRUST_PROXY));
app.disable("x-powered-by");

app.use(session({
    store: redisStore,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "session",
    cookie: {
        domain: ".funmint.ru",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 30
    }
}));

app.use((req, res, next) => {
    if (req.path.startsWith("/webhook")) return next();

    if (req.is("multipart/form-data"))
        upload.none()(req, res, () => {
            csrf({ value: req => req.body?.csrf_token })(req, res, next);
        });
    else
        csrf({ value: req => req.body?.csrf_token })(req, res, next);
});

app.use((req, res, next) => {
    const now = new Date();

    const date = {
        hour: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
    };

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
 
    console.log(`${date.hour}:${date.minutes}:${date.seconds} ${ip} ${req.method} ${req.url}`);

    next();
});

app.use("/", profileRouter);
app.use("/", limiter, shopRouter);
app.use("/", limiter, authRouter);
app.use("/settings", settingsRouter);
app.use("/webhook", express.json({  limit: "1mb" }), webhookRouter);

app.use("/", async (req, res) => res.redirect("/"));

app.use((err, req, res, next) => {
    if (err.code == "EBADCSRFTOKEN")
        return res.status(400).send("Отсутствуют обязательные параметры");

    next(err);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).send("Ошибка сервера");
});

app.listen(env.PORT, async () => {
    console.log(`Server running on port ${env.PORT}`);
    await initializationPool(pool);

    const [users] = await pool.query("SELECT user_id, subscribe FROM settings WHERE subscribe IS NOT NULL");

    const date = new Date();

    for (const user of users) {
        if (date >= user.subscribe) {
            await pool.execute(
                "UPDATE settings SET subscribe = ? WHERE user_id = ?",
                [null, user.user_id]
            );

            continue;
        }

        startFork(user.user_id);
    }
});

function startFork(user_id) {
    const runnerPath = "C:\\funmint\\src\\runner\\runner.js";
    const child = fork(runnerPath, [user_id]);

    child.on("exit", (code) => {
        console.log(`Exit! UserId >> ${user_id}. Code: ${code}`);

        if (code != 0) 
            startFork(user_id);
    });
}