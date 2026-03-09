const { pool } = require("../../utils/storage.js");

const requiredFields = ["lot_id", "min_price", "outbid"];

module.exports.reduction = async (req, res) => {
    if (!req.session.userId)
        return res.status(401).send("Вы не авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (!requiredFields.every(params => Object.keys(req.body).includes(params)))
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (req.body.min_price && req.body.outbid) {
        const lot_id = Number(req.body.lot_id);
        const min_price = Number(req.body.min_price);
        const outbid = Number(req.body.outbid);

        if (min_price == NaN || min_price > 100000 || min_price < 0
            || outbid == NaN || outbid > 20 || outbid < 0
            || lot_id == NaN)
            return res.status(400).send("Неверно указана мин. цена или перебив");

        try {
            if (min_price > 0 && outbid > 0) {
                await pool.execute(
                    "INSERT INTO reduction_settings(user_id, lot_id, min_price, outbid) VALUES(?, ?, ?, ?)",
                    [req.session.userId, lot_id, min_price, outbid]
                );

                return res.status(201).send("Настройки сохранены");
            } else {
                await pool.execute(
                    "DELETE FROM reduction_settings WHERE lot_id = ? AND user_id = ?",
                    [lot_id, req.session.userId]
                );
            }

            return res.send("Настройки сохранены");
        } catch (ex) {
            if (ex.code === "ER_DUP_ENTRY") {
                await pool.execute(
                    "UPDATE reduction_settings SET min_price = ?, outbid = ? WHERE lot_id = ? AND user_id = ?",
                    [min_price, outbid, lot_id, req.session.userId]
                );

                return res.status(201).send("Настройки сохранены");
            }

            console.error(ex.stack);

            return res.status(500).send("Ошибка сервера");
        }
    }
};