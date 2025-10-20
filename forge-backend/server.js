require('dotenv').config();

const app = require('./src/app');

// Pick up the port from env, fallback to 8080
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${PORT} (from ${process.env.PORT ? 'environment' : 'default'})`);
});

module.exports = app; 
