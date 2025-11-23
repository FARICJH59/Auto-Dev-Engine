// Placeholder - implement Redis-backed API key issuance in follow-up
const express = require('express');
const router = express.Router();

router.get('/keys/issue', (req, res) => {
  res.json({ apiKey: 'demo-key' });
});

module.exports = router;
