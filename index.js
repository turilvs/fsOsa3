require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


app.use(express.json())
app.use(express.static('build'))
app.use(morgan('tiny'))
app.use(cors())

morgan.token('body', (req, res) => JSON.stringify(req.body));

const generateId = () => {
    const max = Math.floor(10000)
    const min = Math.ceil(10)
    const id = Number(Math.floor(Math.random() * (max - min) + min))
    return id
}

app.get('/', (req, res) => {
    res.send('<h1>Morjesta!</h1>')
  })

app.get('/api/persons', (req, res, next) => {
    Person.find({}).then(persons =>  {
        res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    Person.find({})
    .then(people => {
      res.send(`<p>Phonebook has info for ${people.length} people</p><p>${new Date()}</p>`)
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
        name: body.name,
        number: body.number, 
        id: body.id
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

app.post('/api/persons', morgan(':body'), (request, res, next) => {

    const body = request.body
    const pArr = []
    
    
    Person.find({}).then(result => {
        result.forEach(person => {
        pArr.concat(person)
    })
    })
    const pDouble = pArr.find(p => p.name === body.name)

    if (!body.name || !body.number) {
        return res.status(400).json({
          error: 'name or number missing'
        })
      }

    if (pDouble !== undefined) {
        return res.status(400).json({ 
            error: 'name must be unique' 
        })
    }
    const person = new Person({
        name: body.name,
        number: body.number,  
        id: generateId()
    })
    person.save().then(savedPerson =>   {
        res.json(savedPerson)
        console.log('person saved!')
        mongoose.connection.close()
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {

    Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
app.use(unknownEndpoint)


const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
  }

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})