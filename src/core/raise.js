const { env } = require("../utils/storage.js");

const cheerio = require("cheerio");
const requests = require("../utils/requests.js");

module.exports.raise = (golden_key, proxy, profileUrl) => {
    return new Promise(resolve => {
        setTimeout(async () => {
            const [res, $] = await requests.get(profileUrl, golden_key, proxy);
            if (!res) return resolve();

            for (const btn_plus of $(".btn-plus")) {
                const tradeUrl = btn_plus.attribs["href"];

                await parseTrade(golden_key, proxy, tradeUrl);
            }

            return resolve();
        }, env.DELAY);
    });
}

function parseTrade(golden_key, proxy, tradeUrl) {
    return new Promise(resolve => {
        setTimeout(async () => {
            const [res, $] = await requests.get(tradeUrl, golden_key, proxy);
            if (!res) return resolve();

            const jsLotRaise = $(".js-lot-raise");

            const game_id = jsLotRaise.data("game");
            const node_id = jsLotRaise.data("node");

            const raiseInfo = await raiseLot(golden_key, proxy, game_id, node_id);

            if (raiseInfo.modal)
            {
                const modal = cheerio.load(raiseInfo.modal);
                const node_ids = modal("input").map(input => input.attribs["value"]);

                await raiseLot(golden_key, proxy, game_id, node_id, node_ids);
            }

            return resolve();
        }, env.DELAY);
    });
}

function raiseLot(golden_key, proxy, game_id, node_id, node_ids = []) {
    return new Promise(resolve => {
        const body = new URLSearchParams();

        body.append("game_id", game_id);
        body.append("node_id", node_id);

        node_ids.forEach(id => {
            body.append("node_ids[]", id);
        });

        setTimeout(async () => {
            const [res, json] = await requests.post(
                "https://funpay.com/lots/raise", 
                body, golden_key, proxy, null, 
                { "X-Requested-With": "XMLHttpRequest" },
                true
            );

            if (!res) return resolve({});
            return resolve(json);
        }, env.DELAY);
    });
}