const mysql = require("mysql2");

const { RedisStore } = require("connect-redis");
const { createClient } = require("redis");

require("dotenv").config();

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

module.exports.pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
}).promise();

module.exports.redisStore = new RedisStore({
    client: redisClient,
    prefix: "session:",
    ttl: 60 * 60 * 24 * 30
});

module.exports.env = process.env;

module.exports.initializationPool = async (pool) => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
            user_id INT NOT NULL,
            subscribe DATE,
            golden_key VARCHAR(255) UNIQUE,
            proxy VARCHAR(255),
            answer BOOLEAN NOT NULL DEFAULT TRUE,
            review BOOLEAN NOT NULL DEFAULT TRUE,
            reduction BOOLEAN NOT NULL DEFAULT TRUE,
            raise BOOLEAN NOT NULL DEFAULT TRUE,
            PRIMARY KEY (user_id),
            CONSTRAINT fk_user_settings FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS stats (
            user_id INT NOT NULL,
            name VARCHAR(32) NOT NULL,
            balance DECIMAL(12, 3) NOT NULL,
            unit CHAR(1) NOT NULL,
            sales_day DECIMAL(12, 3) NOT NULL,
            sales_month DECIMAL(12, 3) NOT NULL,
            sales_all DECIMAL(12, 3) NOT NULL,
            sales_count INT NOT NULL,
            PRIMARY KEY (user_id),
            CONSTRAINT fk_user_stats FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS answer_settings (
            user_id INT NOT NULL,
            type ENUM('command', 'greeting', 'review', 'confirmed') DEFAULT 'command',
            command VARCHAR(255) DEFAULT '',
            content VARCHAR(2000) NOT NULL,
            PRIMARY KEY (user_id, type, command),
            CONSTRAINT fk_user_answer FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS review_settings (
            user_id INT NOT NULL,
            rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            content VARCHAR(1000) NOT NULL,
            PRIMARY KEY (user_id, rating),
            CONSTRAINT fk_user_review FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS reduction_settings (
            user_id INT NOT NULL,
            lot_id INT NOT NULL,
            min_price DECIMAL(9, 3) NOT NULL,
            outbid DECIMAL(5, 3) NOT NULL,
            CONSTRAINT chk_min_price CHECK (min_price >= 0 AND min_price <= 100000),
            CONSTRAINT chk_outbid CHECK (outbid >= 0 AND outbid <= 20),
            PRIMARY KEY (user_id, lot_id),
            CONSTRAINT fk_user_reduction FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS promocodes (
            name VARCHAR(32) NOT NULL,
            percent SMALLINT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL,
            payment_method VARCHAR(32) NOT NULL,
            plan_period VARCHAR(32) NOT NULL,
            email VARCHAR(255) NOT NULL,
            sum VARCHAR(32) NOT NULL
        );
    `);

    console.log("Pool Initialized");
};