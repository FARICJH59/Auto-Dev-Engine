const express = require('express');
const bodyParser = require('body-parser');
const apiKeyIssuer = require('./apiKeyIssuer');
const workflowStatusHandler = require('./workflowStatusHandler');
const rateLimiter = require('./rateLimiterRedis');

const app = express();
app.use(bodyParser.json());

app.use('/api', apiKeyIssuer);
app.use('/api', workflowStatusHandler);

app.use('/api/agents/:agentId/invoke', rateLimiter);
app.use('/api/workflows/:workflowId/run', rateLimiter);

app.listen(8080, () => console.log('Gateway running on port 8080'));
