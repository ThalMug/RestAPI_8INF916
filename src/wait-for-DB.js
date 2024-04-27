const net = require('net');
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 5432;

const client = new net.Socket();

const tryConnection = () => {
  console.log(`Connecting to ${host}:${port}`);
  client.connect({ port, host }, () => {
    console.log('Connected to DB, starting server...');
    process.exit(0); // Exit the process
  });
};

client.on('error', (error) => {
  console.log('Connection failed, retrying...', error);
  setTimeout(tryConnection, 5000); // try again after 5 seconds
});

tryConnection();