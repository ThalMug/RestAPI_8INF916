const axios = require('axios');

const baseURL = 'http://localhost:3000'; // Adjust the URL based on your server config

var token = null;

async function testRegister(username, email, password, role) {
    try {
        const response = await axios.post(`${baseURL}/register`, {
            username,
            email,
            role,
            password
        });
        console.log('Register Success:', response.data);
    } catch (error) {
        console.error('Register Failed:', error.message.data);
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

async function createAchievement(name, description, image_url){
    try{
        const response = await axios.post(`${baseURL}/achievements/add`, {
            name,
            description,
            image_url
        });
        console.log('Achievement Created:', response.data);
    } catch (error) {
        console.error('Achievement Creation Failed:', error.response.data);
    }
}

// Create a get function to get an achievement by name
async function getAchievements(name){
    try{
        const response = await axios.get(`${baseURL}/achievements/get/${name}`);
        console.log('Achievement Retrieved:', response.data);
    } catch (error) {
        console.error('Achievement Retrieval Failed:', error.response.data);
    }
}

async function getImagesOfAchievements(url){
    try{
        const response = await axios.get(`${baseURL}/images/${url}`);
        console.log('Achievement Images Retrieved:', response.data);
    } catch (error) {
        console.error('Achievement Images Retrieval Failed:', error.response.data);
    }
}


//test server/add-player
async function testAddPlayer(serverIp, playerUuid) {
    try {
        const response = await axios.post(`${baseURL}/server/add-player`, {
            serverIp,
            playerUuid
        });
        console.log('Add Player Success:', response.data);
    } catch (error) {
        console.error('Add Player Failed:', error.response.data);
    }
}

// Replace with the desired test credentials
const username = 'testUser';
const email = 'test@example.com';
const password = 'password123';
const role = 'client';

// const for achievement
const a_name = 'testAchievement';
const a_description = 'testDescription';
const a_image_url = 'husky.jpeg';

async function runTests() {
    await testRegister(username, email, password, role); // Test Registration
    //await getProtected(token, username);
    await testLogin(email, password); // Test Login
    
    await testAddPlayer("172.10.0.1", '1234567890');
    //await getProtected(token, username);
    //await createAchievement(a_name, a_description, a_image_url); // Test Achievement Creation
    //await getAchievements(a_name); // Test Achievement Retrieval
    //await getImagesOfAchievements(a_image_url); // Test Achievement Image Retrieval
}

runTests();