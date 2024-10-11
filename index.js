const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

require('dotenv').config()
//Import the model from phonebook.js
const Phone = require('./models/phonebook')

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())


morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let phones = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (req, res) => {
  Phone.find({}).then(phones => {
    response.json(phones)
  })
})

let visitors = 0
const currentDate = new Date().toString()
app.get('/info', (req, res) => {
  visitors += 1
  res.send(`
            <div> 
              <p>This site has been visited by ${visitors} visitors</p>
              <p>${currentDate}</p>
            </div>
          `)
})

// Fetch a specific person by ID
app.get('/api/persons/:id', (req, res) => {
  Phone.findById(req.params.id).then(phone => {
    if (phone) {
      res.json(phone)
    } else {
      res.status(404).end()
    }
  }).catch(error => {
    res.status(500).json({ error: 'failed to fetch person' })
  })
})

// Delete a person by ID
app.delete('/api/persons/:id', (req, res) => {
  Phone.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => res.status(500).json({ error: 'failed to delete' }))
})

// Add a new person
app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'content missing' })
  }

  const phone = new Phone({
    name: body.name,
    number: body.number
  })

  phone.save().then(savedPhone => {
    res.json(savedPhone)
  })
})

// Update a person's number
app.put('/api/persons/:id', (req, res) => {
  const body = req.body

  const phone = {
    name: body.name,
    number: body.number
  }

  Phone.findByIdAndUpdate(req.params.id, phone, { new: true })
    .then(updatedPhone => {
      res.json(updatedPhone)
    })
    .catch(error => res.status(500).json({ error: 'failed to update' }))
})


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})