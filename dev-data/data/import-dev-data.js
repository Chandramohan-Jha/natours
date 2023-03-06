const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

// connect to mongodb
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_LOCAL).then((con) => {
  console.log('Database connected successfully✌️');
});

// Read json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//import data into db
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Loaded 😍');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data from collections
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('all data deleted 🤦‍♂️');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
