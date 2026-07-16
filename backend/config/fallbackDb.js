const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../database_fallback.json');

const readData = () => {
  if (!fs.existsSync(FILE_PATH)) {
    const initialData = {
      users: [],
      admins: [],
      bookings: [],
      reviews: [],
      messages: []
    };
    fs.writeFileSync(FILE_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  } catch (e) {
    return {
      users: [],
      admins: [],
      bookings: [],
      reviews: [],
      messages: []
    };
  }
};

const writeData = (data) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };
