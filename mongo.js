const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://turilas:${password}@cluster0.gk3i0.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })

    person.save().then(result => {
      console.log(`added ${person.name} number ${person.number} to phonebook!`)
      mongoose.connection.close()
    })
    }

if (process.argv.length === 3) {
    console.log("phonebook:")
  Person.find({}).then(result => {
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
}
if (process.argv.length > 3 && process.argv.length !== 5) {
    console.log('give name and number')
    mongoose.connection.close()
}
