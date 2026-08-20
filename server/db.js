import path from 'path'
import { fileURLToPath } from 'url'

let Database
if (typeof Bun !== 'undefined') {
  const bunSqlite = await import('bun:sqlite')
  Database = bunSqlite.Database
} else {
  const betterSqlite = await import('better-sqlite3')
  Database = betterSqlite.default
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_FILE = path.join(__dirname, 'database.sqlite')

const db = new Database(DB_FILE)
if (db.pragma) {
  db.pragma('journal_mode = WAL')
} else if (db.exec) {
  db.exec('PRAGMA journal_mode = WAL;')
}

// Initialize SQLite Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    type TEXT DEFAULT 'Individual',
    interests TEXT,
    notes TEXT,
    registeredAt TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    detail TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT,
    category TEXT DEFAULT 'General',
    summary TEXT NOT NULL,
    important INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    sentAt TEXT
  );
`)

// Seed initial data if tables are empty
function seedDatabase() {
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get().count
  if (memberCount === 0) {
    const insertMember = db.prepare(`
      INSERT INTO members (name, email, phone, type, interests, registeredAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    insertMember.run('Sarah Ahmed', 'sarah.ahmed@example.com', '(555) 234-5678', 'Family', JSON.stringify(['Community Service & Food Drive', 'Youth Programs & Mentorship']), '8/15/2026')
    insertMember.run('Omar Farooq', 'omar.f@example.com', '(555) 876-5432', 'Individual', JSON.stringify(['Event Planning & Logistics']), '8/18/2026')
  }

  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get().count
  if (eventCount === 0) {
    const insertEvent = db.prepare('INSERT INTO events (day, detail) VALUES (?, ?)')
    insertEvent.run('Sundays', 'Family brunch and community update (11:00 AM)')
    insertEvent.run('Wednesdays', 'Open study circle and discussion (6:30 PM)')
    insertEvent.run('Fridays', 'Gathering, khutbah, and shared meal (1:00 PM)')
  }

  const announcementCount = db.prepare('SELECT COUNT(*) as count FROM announcements').get().count
  if (announcementCount === 0) {
    const insertAnn = db.prepare(`
      INSERT INTO announcements (title, date, category, summary, important)
      VALUES (?, ?, ?, ?, ?)
    `)
    insertAnn.run('Ramadan Preparation & Community Iftar Schedule', 'August 18, 2026', 'Community Event', 'Join us for weekly prep meetings and review the preliminary schedule for nightly Taraweeh and community weekend iftars.', 1)
    insertAnn.run('Monthly Food Pantry Drive — Volunteers Needed', 'August 15, 2026', 'Volunteer', 'Our monthly food distribution is coming up this Saturday. We are seeking volunteers for packing, sorting, and distribution.', 0)
    insertAnn.run('Fall Youth Leadership & Quran Study Registration Open', 'August 10, 2026', 'Education', 'Enrollment is now open for weekend youth mentorship, robotics club, and Quran recitation classes starting September 1st.', 0)
    insertAnn.run('Center Maintenance & Facility Upgrade Update', 'August 5, 2026', 'Facility', 'The main prayer hall HVAC upgrades have been completed. Thank you to all donors who made this facility improvement possible.', 0)
  }
}

seedDatabase()

// --- MEMBERS HELPER FUNCTIONS ---
export function getMembers() {
  const rows = db.prepare('SELECT * FROM members ORDER BY id DESC').all()
  return rows.map((row) => ({
    ...row,
    interests: row.interests ? JSON.parse(row.interests) : [],
  }))
}

export function addMember({ name, email, phone, type, interests, notes }) {
  const registeredAt = new Date().toLocaleDateString()
  const interestsJson = JSON.stringify(interests || [])
  const stmt = db.prepare(`
    INSERT INTO members (name, email, phone, type, interests, notes, registeredAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const info = stmt.run(name, email, phone || '', type || 'Individual', interestsJson, notes || '', registeredAt)
  return {
    id: info.lastInsertRowid,
    name,
    email,
    phone: phone || '',
    type: type || 'Individual',
    interests: interests || [],
    notes: notes || '',
    registeredAt,
  }
}

// --- EVENTS HELPER FUNCTIONS ---
export function getEvents() {
  return db.prepare('SELECT * FROM events ORDER BY id ASC').all()
}

export function addEvent({ day, detail }) {
  const stmt = db.prepare('INSERT INTO events (day, detail) VALUES (?, ?)')
  const info = stmt.run(day, detail)
  return { id: info.lastInsertRowid, day, detail }
}

// --- ANNOUNCEMENTS HELPER FUNCTIONS ---
export function getAnnouncements() {
  const rows = db.prepare('SELECT * FROM announcements ORDER BY id DESC').all()
  return rows.map((r) => ({
    ...r,
    important: Boolean(r.important),
  }))
}

export function addAnnouncement({ title, summary, category, important }) {
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const imp = important ? 1 : 0
  const stmt = db.prepare(`
    INSERT INTO announcements (title, date, category, summary, important)
    VALUES (?, ?, ?, ?, ?)
  `)
  const info = stmt.run(title, date, category || 'General', summary, imp)
  return {
    id: info.lastInsertRowid,
    title,
    date,
    category: category || 'General',
    summary,
    important: Boolean(important),
  }
}

// --- CONTACT MESSAGES HELPER FUNCTIONS ---
export function addContactMessage({ name, email, message }) {
  const sentAt = new Date().toISOString()
  const stmt = db.prepare(`
    INSERT INTO contact_messages (name, email, message, sentAt)
    VALUES (?, ?, ?, ?)
  `)
  const info = stmt.run(name, email, message, sentAt)
  return { id: info.lastInsertRowid, name, email, message, sentAt }
}

export default db
