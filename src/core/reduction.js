const { pool, env } = require("../utils/storage.js");
const requests = require("../utils/requests.js");

module.exports.reduction = async (golden_key, proxy, user_id) => {
    const [lots] = await pool.execute("SELECT * FROM reduction_settings WHERE user_id = ?", [user_id]);

    for (const lot of lots)
        await offerEdit(golden_key, proxy, user_id, lot.lot_id, lot.min_price, lot.outbid);
};

function offerEdit(golden_key, proxy, user_id, lot_id, min_price, outbid) {
    return new Promise(resolve => {
        setTimeout(async () => {
            const [res, $] = await requests.get(`https://funpay.com/lots/offerEdit?offer=${lot_id}`, golden_key, proxy);
            if (!res) {
                await pool.execute(
                    "DELETE FROM reduction_settings WHERE user_id = ? AND lot_id = ?",
                    [user_id, lot_id]
                );

                return resolve();
            }
        
            const form = $(".form-offer-editor");

            const data = parseForm($, form);
            const backUrl = $(".js-back-link").attr("href").replace("trade", "");
            
            const min_price_offer = await checkMinPrice(backUrl, golden_key, proxy, min_price);

            const price = data.price;
            data.price = min_price_offer - outbid;

            if (price <= min_price_offer || data.price <= 0 || data.price < min_price) return resolve();

            await offerSave(golden_key, proxy, data, res.headers.getSetCookie());

            return resolve();
        }, env.DELAY);
    });
}

function offerSave(golden_key, proxy, data, cookie) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(data);

            requests.post("https://funpay.com/lots/offerSave", new URLSearchParams(data), golden_key, proxy, cookie);
            
            return resolve();
        }, env.DELAY);
    });
}

function checkMinPrice(url, golden_key, proxy, min_price) {
    return new Promise(resolve => {
        setTimeout(async () => {
            const [res, $] = await requests.get(url, golden_key, proxy);
            if (!res) return resolve(0);

            let minPrice = 0;

            for (const tc_price of $(".tc-item .tc-price")) {
                const price = parseFloat(tc_price.attribs["data-s"]);

                if ((price < minPrice || minPrice == 0) && price >= min_price)
                    minPrice = price;
            }

            return resolve(minPrice);
        }, env.DELAY);
    });
}

function parseForm($, form) {
    const data = {};

    for (const input of form.find("input")) {
        if (input.attribs["value"] !== undefined)
            data[input.attribs["name"]] = input.attribs["value"];
    }

    for (const textarea of form.find("textarea"))
        data[textarea.attribs["name"]] = $(textarea).text();

    for (const select of form.find("select"))
        data[select.attribs["name"]] = $(select).find("option[selected]").text();

    data["active"] = "on";

    return data;
}