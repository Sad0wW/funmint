const { pool } = require("../../utils/storage.js");
const { hashGoldenKey } = require("../../utils/hash.js");

module.exports.goldenKey = async (req, res) => {
    if (!req.session.userId)
        return res.status(401).send("Вы не авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    const { golden_key } = req.body;

    if (!golden_key)
        return res.status(400).send("Отсутствуют обязательные параметры");

    try {
        await pool.execute(
            "UPDATE settings SET golden_key = ? WHERE user_id = ?", 
            [hashGoldenKey(golden_key), req.session.userId]
        );

        return res.send("Настройки сохранены")
    } catch (ex) {
        console.error(ex.stack);

        return res.status(500).send("Ошибка сервера");
    }
};