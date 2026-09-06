const fs = require('fs');

async function testUpload() {
  const filePath = '../test-land-record.pdf';
  if (!fs.existsSync(filePath)) {
    console.error('Test file not found');
    return;
  }

  const fileData = fs.readFileSync(filePath);
  const blob = new Blob([fileData], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('document', blob, 'test-land-record.pdf');

  try {
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Upload response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error during upload test:', err);
  }
}

testUpload();
