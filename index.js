const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

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
//Ex 3.1
app.get('/api/persons', (req, res) => {
  res.json(phones)
})

//Ex 3.2
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

//Ex 3.3
app.get(`/api/persons/:id`, (req, res) => {
  const id = req.params.id
  const phone = phones.find(v => v.id === id)
  if(phone) {
   res.json(phone)
  }
  else {
    res.status(404).end()
  }
})

//Ex 3.4
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id.toString()
  phones = phones.filter(v => v.id !== id)
  res.status(204).end()
})

//Ex 3.5
function generate_id(n) {
  return Math.floor(Math.random()* 1000)
}
app.post('/api/persons', (req, res) => {
  const body = req.body
  console.log(req.body)
  function getUniqueId() {
    let id = generate_id().toString()
    
    while(phones.find(v => v.id === id)) {
      id = generate_id().toString()
    }
    return id
  }
 
  let add_phone = {
    id : getUniqueId(),
    name : body.name,
    number: body.number
  } 
  console.log('...check phone', add_phone)
  let isDuplicate = phones.find(v => v.name === add_phone.name)

  if(isDuplicate || !body.name || !body.number) {
    res.status(400).json({ 
      error: 'content missing' 
    })
  }
  phones = phones.concat(add_phone)
  res.json(phones)
  
})
//Update data
app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id.toString();
  const body = req.body;

  const phoneIndex = phones.findIndex(v => v.id === id);
  if (phoneIndex === -1) {
    return res.status(404).json({ error: 'Person not found' });
  }
  const updatedPhone = { ...phones[phoneIndex], number: body.number };

  phones[phoneIndex] = updatedPhone;
  res.json(updatedPhone);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})