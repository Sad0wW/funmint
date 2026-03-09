const { pool } = require("../../utils/storage.js");

const allowedFields = ["raise", "answer", "review", "reduction"];

module.exports.toggle = async (req, res) => {
    if (!req.session.userId)
        return res.status(401).send("Вы не авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    const updates = [];
    const values = [];

    for (const key of Object.keys(req.body)) {
        if (!allowedFields.includes(key)) continue;

        const value = String(req.body[key]).toLowerCase() == "on";

        updates.push(`${key} = ?`);
        values.push(value);
    }

    if (updates.length < 1) return res.status(201).send("Настройки сохранены");

    values.push(req.session.userId);

    try {
        await pool.execute(`UPDATE settings SET ${updates.join(", ")} WHERE user_id = ?`, values);

        return res.status(201).send("Настройки сохранены");
    } catch (ex) {
        console.error(ex.stack);

        return res.status(500).send("Ошибка сервера");
    }
};