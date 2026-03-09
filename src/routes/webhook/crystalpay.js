const { pool } = require("../../utils/storage.js");
const { buyProxy } = require("../../services/proxy.js");

const { validSigCrystalPay } = require("./utils/sig.js");

const { fork } = require("child_process");

const allowedIp = [
    "193.141.53.171",
    "193.141.53.176",
    "191.101.112.123",
    "191.101.112.154",
    "185.168.250.38",
    "163.198.213.130"
];

module.exports.crystalpay = async (req, res) => {
    if (!allowedIp.includes(req.ip))
        return res.redirect("/");

    if (!req.body)
        return res.status(400).send("Отсутствует тело запроса");

    let { id, signature, state, method, balance_amount, amount_currency, extra, created_at } = req.body;

    if (state != "payed")
        return res.status(403).send("Инвойс не оплачен");

    if (!validSigCrystalPay(id, signature))
        return res.status(403).send("Подпись указана неверно");
    
    extra = JSON.parse(extra);

    try {
        fetch(
            "https://api.telegram.org/bot7323646040:AAF9n9LDvH0FpPkm62Q5ieOmrludrCpqmP4/sendMessage?"
            + "chat_id=-1002936976448&"
            + `text=${encodeURIComponent(`💰 Пользователь ${extra.email} приобрёл подписку сроком на ${extra.plan_period} месяцев ( ${balance_amount} ${amount_currency} )`)}`
        );
    } catch {}

    await pool.execute(
        "INSERT INTO transactions(id, created_at, payment_method, plan_period, email, sum) VALUES(?, ?, ?, ?, ?, ?)",
        [id, created_at, method, extra.plan_period, extra.email, `${balance_amount} ${amount_currency}`]
    );

    const planMonths = Number(extra.plan_period);

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

    const [user] = (await pool.execute("SELECT id FROM users WHERE email = ?", [extra.email])).at(0);

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