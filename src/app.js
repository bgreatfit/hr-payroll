const express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require("./middleware/errorHandler");
const contractRoutes = require('./routes/contractRoutes');
const jobRoutes = require('./routes/jobRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(bodyParser.json());


app.use('/balances', balanceRoutes);
app.use('/contracts', contractRoutes);
app.use('/jobs', jobRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler);
module.exports = app;
