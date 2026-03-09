const { pool } = require("../../utils/storage.js");

const requiredFields = ["rating", "content"];

module.exports.review = async (req, res) => {
    if (!req.session.userId)
        return res.status(401).send("Вы не авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (!requiredFields.every(params => Object.keys(req.body).includes(params)))
        return res.status(400).send("Отсутствуют обязательные параметры");

    const rating = Number(req.body.rating);

    if (rating == NaN || rating < 1 || rating > 5)
        return res.status(400).send("Рейтинг указан неверно");

    try {
        if (req.body.content) {
            if (String(req.body.content).length > 1000)
                return res.status(400).send("Максимальная длина содержимого — 1000 символов");

            await pool.execute(
                "INSERT INTO review_settings(user_id, rating, content) VALUES(?, ?, ?)",
                [req.session.userId, rating, req.body.content]
            );

            return res.status(201).send("Настройки сохранены");
        }
        else {
            await pool.execute(
                "DELETE FROM review_settings WHERE rating = ? AND user_id = ?",
                [rating, req.session.userId]
            );
        }

        return res.send("Настройки сохранены");
    } catch (ex) {
        if (ex.code === "ER_DUP_ENTRY") {
            if (String(req.body.content).length > 1000)
                return res.status(400).send("Максимальная длина содержимого — 1000 символов");

            await pool.execute(
                "UPDATE review_settings SET content = ? WHERE rating = ? AND user_id = ?",
                [req.body.content, rating, req.session.userId]
            );

            return res.status(201).send("Настройки сохранены");
        }

        console.error(ex.stack);

        return res.status(500).send("Ошибка сервера");
    }
};