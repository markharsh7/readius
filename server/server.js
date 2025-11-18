// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); 

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => { 
  res.send('Readus API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});