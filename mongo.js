const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://phonebook:${password}@cluster0.dld8y.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

// Define the schema
const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// Define the model
const Phone = mongoose.model('Phone', phoneSchema);

// Connect to MongoDB
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');

    // If name and number are provided, add new entry
    if (name && number) {
      const newPhoneEntry = new Phone({ name, number });
      return newPhoneEntry.save().then(() => {
        console.log(`Added ${name} number ${number} to phonebook`);
        return Phone.find({});
      });
    } else {
      // If no new name and number are provided, just print all the existing data
      return Phone.find({});
    }
  })
  .then(result => {
    console.log('Phonebook entries:');
    result.forEach(entry => {
      console.log(`${entry.name} ${entry.number}`);
    });
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err.message);
    mongoose.connection.close();
  });
