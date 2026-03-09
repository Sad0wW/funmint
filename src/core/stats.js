const { pool, env } = require("../utils/storage.js");
const requests = require("../utils/requests.js");

module.exports.stats = async (golden_key, proxy, user_id) => {
    let data = {
        name: "",
        balance: 0,
        unit: "₽",
        sales: {
            day: 0,
            month: 0,
            all: 0
        },
        salesCount: 0
    };

    let sig = null;

    while (true) {
        [data, sig] = await parseStats(golden_key, proxy, data, sig);
        if (!sig) break;
    }

    if (!data.name) return;

    try {
        await pool.execute(
            `INSERT INTO stats (user_id, name, balance, unit, sales_day, sales_month, sales_all, sales_count) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                balance = VALUES(balance),
                unit = VALUES(unit),
                sales_day = VALUES(sales_day),
                sales_month = VALUES(sales_month),
                sales_all = VALUES(sales_all),
                sales_count = VALUES(sales_count)`,
            [user_id, data.name, data.balance, data.unit, data.sales.day, data.sales.month, data.sales.all, data.salesCount]
        );
    } catch (ex) {
        console.error(ex);
    }
};

function parseStats(golden_key, proxy, data, sig) {
    return new Promise(resolve => {
        setTimeout(async () => {
            let res, $;

            if (sig)
                [res, $] = await requests.post("https://funpay.com/orders/trade", new URLSearchParams({ "continue": sig }), golden_key, proxy);
            else
                [res, $] = await requests.get("https://funpay.com/orders/trade", golden_key, proxy);

            if (!res) return resolve([null, null]);

            const continue_input = $("input[name=\"continue\"]");

            if (!data.name) {
                data.name = $(".user-link-name").eq(0).text();

                const badge_balance = $(".badge-balance");

                if (badge_balance.length > 0) {
                    const balance_separator = badge_balance.text().split(" ");

                    data.balance = parseFloat(balance_separator[0]);
                    data.unit = balance_separator[1];
                }
                else if ($(".unit").length > 0)
                    data.unit = $(".unit").eq(0).text();
            }

            const tc_items = $("a[class=\"tc-item\"]");

            data.salesCount += tc_items.length;

            for (const tc_item of tc_items) {
                const lot = $(tc_item);

                const price = parseFloat(lot.find(".tc-price").text());
                const dateTime = lot.find(".tc-date-time").text();

                data.sales.all += price;

                if (dateTime.includes("сегодня")) {
                    data.sales.day += price;
                    continue;
                }

                const date = lot.find(".tc-date-left").text();

                if (!date.includes("месяц") && !date.includes("год") && !date.includes("лет"))
                    data.sales.month += price;
            }

            if (continue_input.length < 1)
                return resolve([data, null]);

            sig = continue_input.attr("value");

            return resolve([data, sig])
        }, env.DELAY);
    });
}