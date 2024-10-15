const express = require('express')
const app = express()
require('dotenv').config()

const Phone = require('./models/phonebook')

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

const cors = require('cors')
const morgan = require('morgan')

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})


morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (req, res) => {
  Phone.find({}).then(phones => {
    res.json(phones)
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
app.get('/api/persons/:id', (req, res, next) => {
  Phone.findById(req.params.id).then(phone => {
    if (phone) {
      res.json(phone)
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
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
// Delete a person by ID
app.delete('/api/persons/:id', (req, res, next) => {
  Phone.findByIdAndDelete(req.params.id)
    .then(result => {
      if (result) {
        res.status(204).end(); // No content, deletion successful
      } else {
        res.status(404).json({ error: 'Phone not found' }); // Handle non-existent ID
      }
    })
    .catch(error => next(error));
});

// Update a person's number
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const phone = {
    name: body.name,
    number: body.number
  }

  Phone.findByIdAndUpdate(req.params.id, phone, { new: true })
    .then(updatedPhone => {
      res.json(updatedPhone)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})