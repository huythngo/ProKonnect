const express = require('express');
const app = express();

const connectDB = require('./config/db');
const path = require('path');
const { dirname } = require('path');
connectDB();

app.use(express.json());

// define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

module.exports = app