const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

let persons = [
    {
        name: 'pentti',
        number: 12345,
        id: 1
    },
    {
        name: 'pirjo',
        number: 00000,
        id: 2
    },
    {
        name: 'marjatta',
        number: 555555,
        id: 3
    },
    {
        name: 'lauri',
        number: 098765,
        id: 4
    }
]

app.use(express.json())
app.use(express.static('build'))
app.use(morgan('tiny'))
app.use(cors())

morgan.token('body', (req, res) => JSON.stringify(req.body));

const getInfo = () => {
    let length = Number(persons.length)
    return `Phonebook has info for ${length} people`
}
const generateId = () => {
    const max = Math.floor(10000)
    const min = Math.ceil(10)
    const id = Number(Math.floor(Math.random() * (max - min) + min))
    return id
}

const createPerson = (name, number) => {
    const max = Math.floor(10000)
    const min = Math.ceil(10)
    const id = Number(Math.floor(Math.random() * (max - min) + min))

    let person = {name, number, id }

    return person
}

app.get('/', (req, res) => {
    res.send('<h1>Morjesta!</h1>')
  })

app.get('/api/persons', (req, res) => {
  res.json(persons)
  
})

app.get('/info', (req, res) => {
    res.send(`<div>
    <p>${getInfo()}</p>
    <p>${new Date()}</p>
    </div>`)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

app.post('/api/persons', morgan(':body'), (request, res) => {

    const body = request.body
    const pDouble = persons.find(p => p.name === body.name)

    if (!body.number) {
        return res.status(400).json({ 
            error: "number missing"
        })
    }

    if (!body.name) {
        return res.status(400).json({ 
            error: 'name missing' 
        })
    }

    if (pDouble !== undefined) {
        return res.status(400).json({ 
            error: 'name must be unique' 
        })
    }

    const person = {
        name: body.name,
        number: body.number,  
        id: generateId()
    }
    persons = persons.concat(person)
    res.json(person)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
})



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})