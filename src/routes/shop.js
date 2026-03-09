const express = require("express");
const PQueue = require("p-queue").default;

const crypto = require("crypto");

const { pool, env } = require("../utils/storage.js");

const router = express.Router();

const queue = new PQueue({
    interval: 1000,
    intervalCap: 5
});

const periods = {
    "1": 199,
    "3": 399,
    "6": 699,
    "12": 1299
};

router.post("/shop", async (req, res) => {
    if (!req.session.userId)
        return res.status(401).send("Вы не авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    let { period, method, promocode } = req.body;

    if (!period || !method)
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (!Object.keys(periods).includes(period))
        return res.status(400).send("Указанного периода не существует");

    const [user] = (await pool.execute("SELECT email FROM users WHERE id = ?", [req.session.userId])).at(0);
    [promocode] = (await pool.execute("SELECT percent FROM promocodes WHERE name = ?", [promocode])).at(0);

    const extra = JSON.stringify({
        email: user.email,
        plan_period: period
    });

    let amount = periods[period];

    if (promocode)
        amount = Math.ceil(amount - (amount * promocode.percent / 100));

    const response = await queue.add(async () => {
        switch (method) {
            case "crystalpay":
                return await fetch("https://api.crystalpay.io/v3/invoice/create/", {
                    method: "POST",
                    body: JSON.stringify({
                        auth_login: env.CRYSTALPAY_LOGIN,
                        auth_secret: env.CRYSTALPAY_AUTH_SECRET,
                        amount: amount,
                        type: "purchase",
                        lifetime: 5,
                        description: `Подписка FunMint (${period} месяц)`,
                        extra: extra,
                        payer_details: user.email,
                        redirect_url: env.CRYSTALPAY_REDIRECT_URL,
                        callback_url: env.CRYSTALPAY_CALLBACK_URL
                    })
                });
            case "sbp":
                return await fetch("https://app.platega.io/transaction/process", {
                    method: "POST",
                    body: JSON.stringify({
                        paymentMethod: 2,
                        id: crypto.randomUUID().toString(),
                        paymentDetails: {
                            amount: amount,
                            currency: "RUB"
                        },
                        description: `Подписка FunMint (${period} месяц)`,
                        return: env.PLATEGA_RETURN_URL,
                        failedUrl: env.PLATEGA_FAIL_URL,
                        payload: extra
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        "X-MerchantId": env.PLATEGA_MERCHANT_ID,
                        "X-Secret": env.PLATEGA_API_KEY
                    }
                });
            default:
                return null;
        }
    });

    if (!response)
        return res.status(400).send("Указанного метода оплаты не существует");

    if (!response.ok)
        return res.send("/oops");

    const json_data = await response.json();

    if (json_data.error || (json_data.status && json_data.status != "PENDING"))
        return res.send("/oops");
    
    return res.send(json_data.url ?? json_data.redirect);
});

module.exports.shopRouter = router;