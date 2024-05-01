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
                ip_address VARCHAR(45) UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS achievements (
                id int PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image TEXT
            );

            INSERT INTO achievements (id, name, description, image)
                SELECT * FROM (
                    VALUES 
                        (1, 'Jesus ?!?!', 'Walk on water', 'https://example.com/achievement1.jpg'),
                        (2, 'Wtf', 'Get on Zeus head', 'https://example.com/achievement2.jpg'),
                        (3, 'Fffffantastic', 'Press F', 'https://example.com/achievement3.jpg'),
                        (4, 'Vrouuuum', 'Sprint for the first time', 'https://example.com/achievement4.jpg'),
                        (5, 'Ratatata', 'Discharge your magazine', 'https://example.com/achievement5.jpg')
                ) AS tmp (id, name, description, image)
                WHERE NOT EXISTS (
                    SELECT 1 FROM achievements WHERE achievements.id = tmp.id
                );



            CREATE TABLE IF NOT EXISTS user_achievements (
                user_uuid UUID REFERENCES users(uuid),
                achievement_id int REFERENCES achievements(id),
                PRIMARY KEY (user_uuid, achievement_id)
            );

            CREATE TABLE IF NOT EXISTS friends (
                user_uuid UUID NOT NULL,
                friend_uuid UUID NOT NULL,
                PRIMARY KEY (user_uuid, friend_uuid),
                FOREIGN KEY (user_uuid) REFERENCES users(uuid),
                FOREIGN KEY (friend_uuid) REFERENCES users(uuid)
            );

            
        `);
        console.log('Tables created successfully');
    } catch (err) {
        console.error(err);
    }
};

module.exports = { pool, createTables };
