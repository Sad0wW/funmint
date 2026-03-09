const { pool } = require("../../utils/storage.js");
const { comparePassword } = require("../../utils/hash.js");

const { sendEmail } = require("../../utils/email.js");
const { generateCode } = require("./utils/random.js");

module.exports.login = async (req, res) => {
    if (req.session.userId) 
        return res.status(403).send("Вы уже авторизованы");

    if (!req.body)
        return res.status(400).send("Отсутствуют обязательные параметры");

    const { email, password, code } = req.body;

    if (!code && (!email || !password))
        return res.status(400).send("Отсутствуют обязательные параметры");

    if (code && req.session.code)
        return await success(req, res, req.session.email, req.session.password, req.session.code !== code);
    else
        return await success(req, res, email, password, true);
};

async function success(req, res, email, password, requestCode) {
    try {
        const [result] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (result.length < 1)
            return res.send("Код авторизации отправлен на вашу почту");

        if (!(await comparePassword(password, result[0].password)))
            return res.status(403).send("Почта или пароль указаны неверно");

        if (requestCode && !req.session.code) {
            req.session.code = generateCode();

            await sendEmail(
                email, 
                "Подтверждение адреса электронной почты", 
                `Вход на Funmint 🔐\n\nВы запрашивали вход на сайт. Вот ваш код авторизации:\n\n🔐 Код подтверждения: ${req.session.code}\n\nЕсли вы не запрашивали этот код, просто проигнорируйте это письмо.\n\nС уважением,\nКоманда FunMint\nhttps://funmint.ru/`,
                await new Promise(resolve => {
                    res.render("letter", { isRegistering: false, code: req.session.code }, (err, html) => {
                        resolve(html);
                    });
                })
            );
            
            req.session.email = email;
            req.session.password = password;
        } else if (!requestCode) {
            req.session.userId = result[0].id;

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
                return res.status(201).send("Авторизация успешна!");
        });
    } catch (ex) {
        console.error(ex.stack);
        return res.status(500).send("Ошибка сервера");
    }
}