const { pool, env } = require("../utils/storage.js");
const { dehashGoldenKey } = require("../utils/hash.js");

const requests = require("../utils/requests.js");

const { raise } = require("../core/raise.js");
const { stats } = require("../core/stats.js");
const { answer } = require("../core/answer.js");
const { reduction } = require("../core/reduction.js");

async function runner(user_id) {
    console.log(`Started! UserId >> ${user_id}`);

    while (true) {
        const [settings] = (await pool.execute("SELECT * FROM settings WHERE user_id = ?", [user_id])).at(0);
        if (!settings || !settings.golden_key || !settings.proxy || !settings.subscribe) {
            await delay();
            continue;
        }

        const date = new Date();

        if (date >= settings.subscribe) {
            await pool.execute(
                "UPDATE settings SET subscribe = ? WHERE user_id = ?",
                [null, user_id]
            );

            return;
        }

        const golden_key = dehashGoldenKey(settings.golden_key);

        const [res, $] = await request(golden_key, settings.proxy);
        if (!res) {
            await delay();
            continue;
        };

        const user_link = $(".user-link-dropdown");

        if (user_link.length == 0) {
            await pool.execute(
                "UPDATE settings SET golden_key = ? WHERE golden_key = ?",
                [null, settings.golden_key]
            );

            await delay();
            continue;
        }

        if (settings.answer)
            await startCore(answer, golden_key, settings.proxy, user_id, settings.review, $);

        if (settings.reduction)
            await startCore(reduction, golden_key, settings.proxy, user_id);

        if (settings.raise)
            await startCore(raise, golden_key, settings.proxy, user_link.attr("href"));

        await startCore(stats, golden_key, settings.proxy, user_id);
    }
}

function request(golden_key, proxy) {
    return new Promise(resolve => {
        setTimeout(async () => {
            const [res, $] = await requests.get("https://funpay.com/chat/", golden_key, proxy);
            if (!res) return resolve([null, null]);

            return resolve([res, $]);
        }, env.DELAY);
    });
}

function delay() {
    return new Promise(resolve => setTimeout(() => resolve(), env.DELAY));
}

function startCore(func, ...args) {
    return new Promise(resolve => {
        setTimeout(async () => {
            await func(...args);
            return resolve();
        }, env.DELAY);
    });
}

async function safeRunner(user_id) {
    while (true) {
        try {
            await runner(user_id);
        } catch (err) {
            console.error(err);
            console.log("Restarting runner in 1s...");
            await new Promise(res => setTimeout(res, 1000));
        }
    }
}

safeRunner(process.argv[2]);