const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const app = express();

/* CORS */

app.use(cors({

    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import Routes
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');

// Use Routes

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);



module.exports = app;