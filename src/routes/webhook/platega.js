const { pool, env } = require("../../utils/storage.js");
const { buyProxy } = require("../../services/proxy.js");

const { fork } = require("child_process");

module.exports.platega = async (req, res) => {
    if (!req.body)
        return res.status(400).send("Отсутствует тело запроса");

    if (req.headers["x-merchantid"] != env.PLATEGA_MERCHANT_ID || req.headers["x-secret"] != env.PLATEGA_API_KEY)
        return res.status(400).send("Подпись указана неверно");

    let { id, amount, currency, status, payload } = req.body;

    if (status != "CONFIRMED")
        return res.status(403).send("Инвойс не оплачен");

    payload = JSON.parse(payload);

    try {
        fetch(
            "https://api.telegram.org/bot7323646040:AAF9n9LDvH0FpPkm62Q5ieOmrludrCpqmP4/sendMessage?"
            + "chat_id=-1002936976448&"
            + `text=${encodeURIComponent(`💰 Пользователь ${payload.email} приобрёл подписку сроком на ${payload.plan_period} месяцев ( ${amount} ${currency} )`)}`
        );
    } catch {}

    await pool.execute(
        "INSERT INTO transactions(id, created_at, payment_method, plan_period, email, sum) VALUES(?, ?, ?, ?, ?, ?)",
        [id, new Date(), "SBP", payload.plan_period, payload.email, `${amount} ${currency}`]
    );

    const planMonths = Number(payload.plan_period);

    const startDate = new Date();
    const endDate = new Date();
    
    endDate.setMonth(endDate.getMonth() + planMonths);

    const diffMs = endDate - startDate;

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const proxy = await buyProxy(days);

    await pool.execute(
        "UPDATE settings SET subscribe = ?, proxy = ?", 
        [endDate, proxy]
    );

    const [user] = (await pool.execute("SELECT id FROM users WHERE email = ?", [payload.email])).at(0);

    startFork(user.id);

    return res.send("Инвойс оплачен");
};

function startFork(user_id) {
    const runnerPath = "C:\\funmint\\src\\runner\\runner.js";
    const child = fork(runnerPath, [user_id]);

    child.on("exit", (code) => {
        console.log(`Exit! UserId >> ${user_id}. Code: ${code}`);

        if (code != 0) 
            startFork(user_id);
    });
}