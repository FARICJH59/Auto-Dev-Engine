const fs = require('fs');
const path = require('path');

const createTestFile = () => {
  const filePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(filePath, 'Test file created successfully');
  console.log('File created successfully at:', filePath);
};

createTestFile();