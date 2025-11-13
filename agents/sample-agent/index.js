const express = require('express');
const app = express();
app.use(express.json());

app.post('/invoke', async (req, res) => {
  const { input } = req.body;
  res.json({
    agentId: 'sample-agent',
    status: 'success',
    output: { message: `Processed input: ${JSON.stringify(input)}` }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Sample Agent running on port', PORT));
