const axios = require('axios');

async function registerFakeServer() {
    try {
        const response = await axios.post('http://localhost:3000/servers/register', {
            ip_address: "120.0.0.1"
        });

        console.log('Register Success:', response.data);
    } catch (error) {
        console.error('Register Failed:', error.message.data);
    }
}



registerFakeServer();