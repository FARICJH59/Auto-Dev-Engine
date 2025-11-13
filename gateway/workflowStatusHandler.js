const express = require('express');
const router = express.Router();

router.post('/workflows/:workflowId/status', (req, res) => {
  // Accept status updates
  console.log('Workflow status update', req.params.workflowId, req.body);
  res.sendStatus(204);
});

module.exports = router;
