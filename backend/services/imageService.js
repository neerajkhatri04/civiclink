const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const uploadImage = async (file) => {
  try {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Upload error:', error);
        reject({ success: false, error: error.message });
      });

      stream.on('finish', async () => {
        try {
          // Make the file publicly readable
          await fileUpload.makePublic();

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve({ success: true, url: publicUrl, fileName });
        } catch (error) {
          console.error('Error making file public:', error);
          reject({ success: false, error: error.message });
        }
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  uploadImage
};
