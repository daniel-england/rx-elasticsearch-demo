const express = require('express');
const app = express();
const search = require('./search');

app.get('/search', search);

app.listen({port: 3000});