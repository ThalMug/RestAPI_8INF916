const axios = require('axios');

const baseURL = 'http://localhost:3000'; // Adjust the URL based on your server config

var token = null;

async function testRegister(username, email, password) {
    try {
        const response = await axios.post(`${baseURL}/register`, {
            username,
            email,
            password
        });
        console.log('Register Success:', response.data);
    } catch (error) {
        console.error('Register Failed:', error.response.data);
    }
}

async function testLogin(email, password) {
    try {
        const response = await axios.post(`${baseURL}/login`, {
            email,
            password
        });
        token = response.data.token;
        console.log('Login Success:', response.data.token);
    } catch (error) {
        console.error('Login Failed:', error.response.data);
    }
}

async function getProtected(token, user) {
    try {
        const response = await axios.get(`${baseURL}/protected`, {
            headers: {
                Authorization: `Bearer ${token}`
            }, 
            user : user
        });
        console.log('Protected Data:', response.data);
    } catch (error) {
        console.error('Protected Data Failed:', error.response.data);
    }
}

// Replace with the desired test credentials
const username = 'testUser';
const email = 'test@example.com';
const password = 'password123';

async function runTests() {
    await testRegister(username, email, password); // Test Registration
    await getProtected(token, username);
    await testLogin(email, password); // Test Login
    await getProtected(token, username);
}

runTests();