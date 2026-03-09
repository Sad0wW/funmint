const { pool } = require("../../utils/storage.js");
const { hashPassword } = require("../../utils/hash.js");

const { sendEmail } = require("../../utils/email.js");
const { generateCode } = require("./utils/random.js");

module.exports.register = async (req, res) => {
    if (req.session.userId) 
        return res.status(403).send("Вы уже авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    let { email, password, terms, code } = req.body;

    if (!code && (!email || !password))
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (email && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
        return res.status(400).send("Адрес электронной почты недействителен");

    if (password) {
        password = password.replace(" ", "");

        if (password.length < 8 || password.length > 32)
            return res.status(400).send("Пароль должен иметь длину от 8 до 32 символов");
    }

    if (!code && terms != "true")
        return res.status(403).send("Примите политику");

    const [result] = await pool.execute(
        "SELECT * FROM users WHERE email = ?", 
        [email ?? req.session.email]
    );

    if (result.length > 0)
        return res.send("Код авторизации отправлен на вашу почту");

    if (code && req.session.code)
        return await success(req, res, req.session.email, req.session.password, req.session.code !== code);
    else
        return await success(req, res, email, password, true);
};

async function success(req, res, email, password, requestCode) {
    try {
        if (requestCode && !req.session.code) {
            req.session.code = generateCode();

            await sendEmail(
                email, 
                "Подтверждение адреса электронной почты", 
                `Добро пожаловать на FunMint 🎉\n\nДля завершения регистрации используйте следующий код:\n\n🔐 Код подтверждения: ${req.session.code}\n\nЕсли вы не запрашивали этот код, просто проигнорируйте это письмо.\n\nС уважением,\nКоманда FunMint\nhttps://funmint.ru/`,
                await new Promise(resolve => {
                    res.render("letter", { isRegistering: true, code: req.session.code }, (err, html) => {
                        resolve(html);
                    });
                })
            );

            req.session.email = email;
            req.session.password = password;
        } else if (!requestCode) {
            const passwordHash = await hashPassword(password);

            const [user] = await pool.execute(
                "INSERT INTO users(email, password) VALUES(?, ?)", 
                [email, passwordHash]
            );

            await pool.execute("INSERT INTO settings(user_id) VALUES(?)", [user.insertId]);

            req.session.userId = user.insertId;

            delete req.session.code;
            delete req.session.email;
            delete req.session.password;
        }

        req.session.save(err => {
            if (err) {
                console.error(err.stack);

                return res.status(500).send("Ошибка сервера");
            }

            if (requestCode)
                return res.send("Код авторизации отправлен на вашу почту");
            else
                return res.status(201).send("Регистрация успешна!");
        });
    } catch (ex) {
        if (ex.code === "ER_DUP_ENTRY") {
            return res.send("Код авторизации отправлен на вашу почту");
        }

        console.error(ex.stack);
        return res.status(500).send("Ошибка сервера");
    }
}