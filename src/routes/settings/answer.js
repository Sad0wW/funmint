const { pool } = require("../../utils/storage.js");

const requiredFields = ["type", "content"];
const allowedType = ["command", "greeting", "review", "confirmed"];

module.exports.answer = async (req, res) => {
    if (!req.session.userId)
        return res.status(401).send("Вы не авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (!requiredFields.every(params => Object.keys(req.body).includes(params)))
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (!allowedType.includes(String(req.body.type).toLowerCase()))
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (req.body.type.toLowerCase() == "command" && !req.body.command)
        return res.status(400).send("Команда не найдена");

    try {
        if (req.body.content) {
            if (String(req.body.content).length > 2000)
                return res.status(400).send("Максимальная длина содержимого — 2000 символов");

            await pool.execute(
                "INSERT INTO answer_settings(user_id, type, content, command) VALUES(?, ?, ?, ?)",
                [
                    req.session.userId, req.body.type.toLowerCase(), req.body.content,
                    req.body.command ? req.body.command.toLowerCase() : ""
                ]
            );

            return res.status(201).send("Настройки сохранены");
        }
        else {
            await pool.execute(
                "DELETE FROM answer_settings WHERE command = ? AND type = ? AND user_id = ?",
                [req.body.command ?? "", req.body.type, req.session.userId]
            );
        }

        return res.send("Настройки сохранены");
    } catch (ex) {
        if (ex.code === "ER_DUP_ENTRY") {
            if (String(req.body.content).length > 2000)
                return res.status(400).send("Максимальная длина содержимого — 2000 символов");

            await pool.execute(
                "UPDATE answer_settings SET content = ? WHERE command = ? AND type = ? AND user_id = ?",
                [req.body.content, req.body.command ?? "", req.body.type, req.session.userId]
            );

            return res.status(201).send("Настройки сохранены");
        }

        console.error(ex.stack);

        return res.status(500).send("Ошибка сервера");
    }
};