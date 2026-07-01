const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const interviewRoutes = require('./routes/interview');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/sessions', sessionRoutes);
app.use('/interview', interviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Mentorque Interview Platform API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});