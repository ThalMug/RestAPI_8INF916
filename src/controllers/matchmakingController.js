

async function matchmake(req, res) {
    const { user_uuid, server_id } = req.body;
    try {
        const newMatch = await pool.query(
            'INSERT INTO matches (user_uuid, server_id) VALUES ($1, $2) RETURNING *',
            [user_uuid, server_id]
        );
        res.json(newMatch.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}