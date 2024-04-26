const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const createTables = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS users (
                uuid UUID PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                role VARCHAR(255) CHECK (role IN ('client', 'dedicated game server')),
                password VARCHAR(255) NOT NULL,
                salt VARCHAR(255) NOT NULL,
                rank INT CHECK (rank >= 1 AND rank <= 5),
                kda FLOAT
            );

            CREATE TABLE IF NOT EXISTS dedicated_server (
                server_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                ip_address VARCHAR(45)
            );

            CREATE TABLE IF NOT EXISTS achievements (
                id int PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image TEXT
            );

            CREATE TABLE IF NOT EXISTS user_achievements (
                user_uuid UUID REFERENCES users(uuid),
                achievement_id int REFERENCES achievements(id),
                PRIMARY KEY (user_uuid, achievement_id)
            );
        `);
        console.log('Tables created successfully');
    } catch (err) {
        console.error(err);
    }
};

module.exports = { pool , createTables };
