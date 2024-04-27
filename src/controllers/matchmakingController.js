async function matchmake(req, res) {
    const { user_uuid } = req.body;
    try {
        // Get the user's rank and KDA
        const user = await pool.query(
            'SELECT rank, kda FROM users WHERE uuid = $1',
            [user_uuid]
        );

        // Find a match based on the user's rank and KDA
        const match = await pool.query(
            'SELECT * FROM matches WHERE ABS(rank - $1) <= 10 AND ABS(kda - $2) <= 0.5 ORDER BY ABS(rank - $1) + ABS(kda - $2) LIMIT 1',
            [user.rows[0].rank, user.rows[0].kda]
        );

        // If a match is found, return it
        if (match.rows.length > 0) {
            res.json(match.rows[0]);
        } else {
            // If no match is found, return an error message
            res.status(404).send('No match found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}