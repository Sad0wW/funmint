const { pool, env } = require("../utils/storage.js");
const requests = require("../utils/requests.js");

const { review } = require("./review.js");

module.exports.answer = async (golden_key, proxy, user_id, review, $) => {
    for (const chat of $(".unread"))
        await parseChat(chat.attribs["href"], golden_key, proxy, user_id, review);
};

function parseChat(url, golden_key, proxy, user_id, review_status) {
    return new Promise(resolve => {
        setTimeout(async () => {
            const [res, $] = await requests.get(url, golden_key, proxy);
            if (!res) resolve();

            const bot_name = $(".user-link-name").eq(0).text();
            const bot_link = $(".user-link-dropdown").attr("href");

            const bot_msg = $(`a.chat-msg-author-link[href=\"${bot_link}\"]`);

            const node = $(".chat-float").data("name");
            const csrf_token = $("body").data("app-data")["csrf-token"];

            if (bot_msg.length < 1) {
                const [msg_greeting] = (await pool.execute(
                    "SELECT * FROM answer_settings WHERE type = ? AND user_id = ?",
                    ["greeting", user_id]
                )).at(0);

                if (msg_greeting) await sendMessage(golden_key, proxy, formatContent(msg_greeting.content, $), node, csrf_token, res.headers.getSetCookie());
            }

            const author_last_msg = $(".chat-message .media-user-name").eq(-1).text();
            if (!author_last_msg.includes(bot_name)) {
                if (author_last_msg.includes("FunPay")) {
                    const text = $(".chat-msg-text").eq(-1).text();

                    if (text.includes("написал отзыв")) {
                        const [msg_review] = (await pool.execute(
                            "SELECT * FROM answer_settings WHERE type = ? AND user_id = ?",
                            ["review", user_id]
                        )).at(0);

                        if (msg_review)
                            await sendMessage(golden_key, proxy, formatContent(msg_review.content, $), node, csrf_token, res.headers.getSetCookie());

                        if (review_status) {
                            const orderUrl = $(".chat-msg-text").eq(-1).find("a").eq(-1).attr("href");
                            await review(golden_key, proxy, user_id, orderUrl);
                        }
                    } 
                    else if (text.includes("Покупатель") && text.includes("подтвердил успешное выполнение") || text.includes("Приглашаем вас")) {
                        const [msg_confirmed] = (await pool.execute(
                            "SELECT * FROM answer_settings WHERE type = ? AND user_id = ?",
                            ["confirmed", user_id]
                        )).at(0);

                        if (msg_confirmed)
                            await sendMessage(golden_key, proxy, formatContent(msg_confirmed.content, $), node, csrf_token, res.headers.getSetCookie());
                    }
                }
                else {
                    const chats = $(".chat-msg-item").toArray();
                    const lastHeadIndex = chats.map(el => $(el).hasClass("chat-msg-with-head")).lastIndexOf(true);
                    const msg_items = chats.slice(lastHeadIndex).map(el => $(el));

                    for (const msg_item of msg_items) {
                        const msg_content = msg_item.find(".chat-msg-text").text();

                        const [answer_settings] = (await pool.execute(
                            "SELECT * FROM answer_settings WHERE command = ? AND user_id = ?",
                            [msg_content, user_id]
                        )).at(0);
                        if (!answer_settings) continue;

                        await sendMessage(golden_key, proxy, formatContent(answer_settings.content, $), node, csrf_token, res.headers.getSetCookie());
                    }
                }
            }

            resolve();
        }, env.DELAY);
    });
}

function sendMessage(golden_key, proxy, content, node, csrf_token, cookie) {
    return new Promise(resolve => {
        setTimeout(() => {
            requests.post(
                "https://funpay.com/runner/",
                new URLSearchParams({
                    "request": JSON.stringify({ 
                        "action": "chat_message", 
                        "data": { 
                            "node": node,
                            "content": content 
                        } 
                    }),
                    "csrf_token": csrf_token
                }),
                golden_key, proxy, cookie
            );

            resolve();
        }, env.DELAY);
    });
}

function formatContent(content, $) {
    const bot_name = $(".user-link-name").eq(0).text();
    const bot_link = $(".user-link-dropdown").attr("href");

    const media = $(".media-body a");

    return content
        .replaceAll("{myname}", bot_name)
        .replaceAll("{myprofilelink}", bot_link)
        .replaceAll("{name}", media.text())
        .replaceAll("{profilelink}", media.attr("href"));
}