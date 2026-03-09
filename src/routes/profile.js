const express = require("express");

const { pool } = require("../utils/storage.js");

const router = express.Router();

router.get("/profile", async (req, res) => {
    if (!req.session.userId) 
        return res.render("login", {
            csrf_token: req.csrfToken()
        });
    
    const [settings] = (await pool.execute("SELECT * FROM settings WHERE user_id = ?", [req.session.userId])).at(0);
    if (!settings) return req.session.destroy(() => res.redirect("/"));

    const date = new Date();

    if (!settings.subscribe || date >= settings.subscribe)
        return res.render("profile", { hasSubscribe: false, csrf_token: req.csrfToken() });

    if (!settings.golden_key)
        return res.render("profile", { hasSubscribe: true, hasGoldenKey: false, csrf_token: req.csrfToken() });

    const [stats] = (await pool.execute("SELECT * FROM stats WHERE user_id = ?", [req.session.userId])).at(0);
    const answer = (await pool.execute("SELECT * FROM answer_settings WHERE user_id = ?", [req.session.userId])).at(0);
    const review = (await pool.execute("SELECT * FROM review_settings WHERE user_id = ?", [req.session.userId])).at(0);
    const reduction = (await pool.execute("SELECT * FROM reduction_settings WHERE user_id = ?", [req.session.userId])).at(0);

    if (stats) {
        for (const index of Object.keys(stats)) {
            if (typeof stats[index] == "string" && stats[index].includes("."))
                stats[index] = parseFloat(stats[index]);
        }
    }

    for (const index of Object.keys(settings)) {
        if (index == "subscribe")
            settings[index] = Math.ceil((settings.subscribe - date) / (1000 * 60 * 60 * 24));
        else if (index != "user_id") {
            if (index == 1 || index == 0)
                settings[index] = index == 1;
        }
    }

    return res.render("profile", {
        hasSubscribe: true,
        hasGoldenKey: true,
        automation: settings,
        stats: stats,
        answer: answer,
        review: review,
        raise: settings.raise,
        reduction: reduction,
        csrf_token: req.csrfToken()
    });
});

router.get("/", async (req, res) => 
    res.render("index", {
        csrf_token: req.csrfToken()
    })
);

module.exports.profileRouter = router;