const express = require('express');
const app = express();

app.get('/ip', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip);
    res.status(200).json({ message: 'Success', ip_address: ip});
});

app.listen(3001, '0.0.0.0', () => {
    console.log('Server running on port 3001');
});