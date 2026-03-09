const { fetch, ProxyAgent } = require("undici");
const cheerio = require("cheerio");

module.exports.get = async (url, golden_key = null, proxy = null, json = false) => {
    const res = await fetch(url, {
        dispatcher: proxy ? new ProxyAgent(proxy) : undefined,
        headers: golden_key ? {
            "Cookie": `golden_key=${golden_key}`
        } : undefined,
        redirect: "manual"
    });

    if (!res.ok) return [null, null];
    if (res.status > 299 && res.status < 400) return [null, null];

    return [res, json ? await res.json() : cheerio.load(await res.text())];
};

module.exports.post = async (url, data, golden_key = null, proxy = null, cookie = null, headers = null, json = false) => {
    if (!headers) headers = {};
    if (golden_key) headers["Cookie"] = `golden_key=${golden_key};${cookie ? cookie.map(c => c.split(";")[0]).join(";") : ""}`;

    const res = await fetch(url, {
        method: "POST",
        body: data,
        dispatcher: proxy ? new ProxyAgent(proxy) : undefined,
        headers: headers
    });

    if (!res.ok) return [null, null];
    if (res.status > 299 && res.status < 400) return [null, null];

    return [res, json ? await res.json() : cheerio.load(await res.text())];
};