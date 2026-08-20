import express from 'express'
import cors from 'cors'
import { readDb, writeDb } from './db.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// --- MEMBERS ENDPOINTS ---
app.get('/api/members', (req, res) => {
  const db = readDb()
  res.json(db.members || [])
})

app.post('/api/members', (req, res) => {
  const { name, email, phone, type, interests, notes } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields.' })
  }

  const db = readDb()
  const newMember = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '',
    type: type || 'Individual',
    interests: Array.isArray(interests) ? interests : [],
    notes: notes || '',
    registeredAt: new Date().toLocaleDateString(),
  }

  db.members = [newMember, ...(db.members || [])]
  writeDb(db)

  res.status(201).json(newMember)
})

// --- EVENTS ENDPOINTS ---
app.get('/api/events', (req, res) => {
  const db = readDb()
  res.json(db.events || [])
})

app.post('/api/events', (req, res) => {
  const { day, detail } = req.body

  if (!day || !detail) {
    return res.status(400).json({ error: 'Day and detail are required fields.' })
  }

  const db = readDb()
  const newEvent = { id: Date.now(), day, detail }
  db.events = [...(db.events || []), newEvent]
  writeDb(db)

  res.status(201).json(newEvent)
})

// --- ANNOUNCEMENTS ENDPOINTS ---
app.get('/api/announcements', (req, res) => {
  const db = readDb()
  res.json(db.announcements || [])
})

app.post('/api/announcements', (req, res) => {
  const { title, summary, category, important } = req.body

  if (!title || !summary) {
    return res.status(400).json({ error: 'Title and summary are required fields.' })
  }

  const db = readDb()
  const newAnnouncement = {
    id: Date.now(),
    title,
    summary,
    category: category || 'General',
    important: Boolean(important),
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  }

  db.announcements = [newAnnouncement, ...(db.announcements || [])]
  writeDb(db)

  res.status(201).json(newAnnouncement)
})

// --- CONTACT ENDPOINT ---
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' })
  }

  const db = readDb()
  const newMessage = {
    id: Date.now(),
    name,
    email,
    message,
    sentAt: new Date().toISOString(),
  }

  db.contactMessages = [newMessage, ...(db.contactMessages || [])]
  writeDb(db)

  res.status(201).json({ message: 'Message received successfully.', contact: newMessage })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
