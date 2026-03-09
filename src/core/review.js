const { pool, env } = require("../utils/storage.js");
const requests = require("../utils/requests.js");

module.exports.review = (golden_key, proxy, user_id, orderUrl) => {
    return new Promise(resolve => {
        setTimeout(async () => {
            const [res, $] = await requests.get(orderUrl, golden_key, proxy);
            if (!res) return resolve();

            const rating = $(".review-container").data("rating");

            const [review_settings] = (await pool.execute(
                "SELECT * FROM review_settings WHERE rating = ? AND user_id = ?",
                [rating, user_id]
            )).at(0);
            if (!review_settings) return resolve();

            const app_data = $("body").data("app-data");

            const author_id = app_data["userId"];
            const csrf_token = app_data["csrf-token"];

            const order_id = $(".review-container").data("order");

            let title;
            $("div.param-item").each((i, param_item) => {
                const h5_text = $(param_item).find("h5").text().trim();
                if (h5_text == "Краткое описание") {
                    title = $(param_item).find("div").text();
                    return false;
                }
            });

            await reviewOrder(golden_key, proxy, review_settings.content.replaceAll("{title}", title), author_id, order_id, csrf_token, res.headers.getSetCookie());

            return resolve();
        }, env.DELAY);
    });
};

function reviewOrder(golden_key, proxy, text, author_id, order_id, csrf_token, cookie) {
    return new Promise(resolve => {
        requests.post(
            "https://funpay.com/orders/review", 
            new URLSearchParams({
                "authorId": author_id,
                "text": text,
                "csrf_token": csrf_token,
                "orderId": order_id
            }), 
            golden_key, proxy, cookie, 
            {
                "X-Requested-With": "XMLHttpRequest",
            }
        );

        return resolve();
    }, env.DELAY);
}