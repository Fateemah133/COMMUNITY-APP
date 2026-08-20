import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import {
  getMembers,
  addMember,
  getEvents,
  addEvent,
  getAnnouncements,
  addAnnouncement,
  addContactMessage,
} from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  try {
    const members = getMembers()
    res.json(members)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/members', (req, res) => {
  const { name, email, phone, type, interests, notes } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields.' })
  }

  try {
    const newMember = addMember({ name, email, phone, type, interests, notes })
    res.status(201).json(newMember)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// --- EVENTS ENDPOINTS ---
app.get('/api/events', (req, res) => {
  try {
    const events = getEvents()
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/events', (req, res) => {
  const { day, detail } = req.body

  if (!day || !detail) {
    return res.status(400).json({ error: 'Day and detail are required fields.' })
  }

  try {
    const newEvent = addEvent({ day, detail })
    res.status(201).json(newEvent)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// --- ANNOUNCEMENTS ENDPOINTS ---
app.get('/api/announcements', (req, res) => {
  try {
    const announcements = getAnnouncements()
    res.json(announcements)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/announcements', (req, res) => {
  const { title, summary, category, important } = req.body

  if (!title || !summary) {
    return res.status(400).json({ error: 'Title and summary are required fields.' })
  }

  try {
    const newAnnouncement = addAnnouncement({ title, summary, category, important })
    res.status(201).json(newAnnouncement)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// --- CONTACT ENDPOINT ---
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required fields.' })
  }

  try {
    const newMessage = addContactMessage({ name, email, message })
    res.status(201).json({ message: 'Message received successfully.', contact: newMessage })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Serve static React build files in production
const distPath = path.join(__dirname, '../dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('/*path', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT} with SQLite database`)
})
