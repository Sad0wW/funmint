const { env } = require("../utils/storage.js");
const requests = require("../utils/requests.js");

module.exports.buyProxy = async (period) => {
    const [res, json] = await requests.get(`https://px6.link/api/${env.PROXY_API_KEY}/buy?count=1&period=${period}&version=3&country=ru`, null, null, true);
    if (!res || json.status == "no") return null;

    const list = json.list;
    const index = Object.keys(list)[0];
    const proxy = list[index];
    
    return `${proxy.type}://${proxy.user}:${proxy.pass}@${proxy.ip}:${proxy.port}`;
};