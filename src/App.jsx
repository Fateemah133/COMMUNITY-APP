import { useEffect, useState } from 'react'
import './App.css'

const navigation = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'events', label: 'Events' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'donations', label: 'Donations' },
  { key: 'register', label: 'Register' },
  { key: 'contact', label: 'Contact' },
]

const defaultAnnouncements = [
  {
    id: 1,
    title: 'Ramadan Preparation & Community Iftar Schedule',
    date: 'August 18, 2026',
    category: 'Community Event',
    summary: 'Join us for weekly prep meetings and review the preliminary schedule for nightly Taraweeh and community weekend iftars.',
    important: true,
  },
  {
    id: 2,
    title: 'Monthly Food Pantry Drive — Volunteers Needed',
    date: 'August 15, 2026',
    category: 'Volunteer',
    summary: 'Our monthly food distribution is coming up this Saturday. We are seeking volunteers for packing, sorting, and distribution.',
    important: false,
  },
  {
    id: 3,
    title: 'Fall Youth Leadership & Quran Study Registration Open',
    date: 'August 10, 2026',
    category: 'Education',
    summary: 'Enrollment is now open for weekend youth mentorship, robotics club, and Quran recitation classes starting September 1st.',
    important: false,
  },
  {
    id: 4,
    title: 'Center Maintenance & Facility Upgrade Update',
    date: 'August 5, 2026',
    category: 'Facility',
    summary: 'The main prayer hall HVAC upgrades have been completed. Thank you to all donors who made this facility improvement possible.',
    important: false,
  },
]

const pillars = [
  {
    title: 'Faith & Fellowship',
    text: 'A welcoming space for prayer, reflection, and lasting friendships.',
  },
  {
    title: 'Education & Growth',
    text: 'Weekly circles, youth mentorship, and family-friendly learning sessions.',
  },
  {
    title: 'Community Service',
    text: 'Supporting neighbors through food drives, charity events, and volunteer outreach.',
  },
]

const programs = [
  'Weekly Friday gatherings',
  'Quran study for all ages',
  'Community iftar dinners',
  'Youth leadership workshops',
]

const events = [
  { day: 'Sundays', detail: 'Family brunch and community update' },
  { day: 'Wednesdays', detail: 'Open study circle and discussion' },
  { day: 'Fridays', detail: 'Gathering, khutbah, and shared meal' },
]

function getInitialPage() {
  const hash = window.location.hash.replace('#', '').trim()
  return navigation.some((item) => item.key === hash) ? hash : 'home'
}

function App() {
  const [page, setPage] = useState(getInitialPage)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactStatus, setContactStatus] = useState('')
  const [contactError, setContactError] = useState('')
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [members, setMembers] = useState([])
  const [siteEvents, setSiteEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [announcementFilter, setAnnouncementFilter] = useState('All')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regType, setRegType] = useState('Individual')
  const [regInterests, setRegInterests] = useState([])
  const [regNotes, setRegNotes] = useState('')
  const [regStatus, setRegStatus] = useState('')
  const [regError, setRegError] = useState('')
  const [regSubmitting, setRegSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, eventsRes, announcementsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/events'),
          fetch('/api/announcements'),
        ])

        if (!membersRes.ok || !eventsRes.ok || !announcementsRes.ok) {
          throw new Error('Failed to load data')
        }

        const [membersData, eventsData, announcementsData] = await Promise.all([
          membersRes.json(),
          eventsRes.json(),
          announcementsRes.json(),
        ])

        setMembers(membersData || [])
        setSiteEvents(eventsData || [])
        setAnnouncements(announcementsData || [])
      } catch (error) {
        console.error(error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      setPage(getInitialPage())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (key) => {
    const nextHash = key === 'home' ? '' : `#${key}`
    window.location.hash = nextHash
    setPage(key)
  }

  const handleContactSubmit = async (event) => {
    event.preventDefault()

    if (!contactName || !contactEmail || !contactMessage) {
      setContactError('Please complete all fields before sending your message.')
      setContactStatus('')
      return
    }

    setContactSubmitting(true)
    setContactError('')
    setContactStatus('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName.trim(),
          email: contactEmail.trim(),
          message: contactMessage.trim(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit message')
      }

      setContactStatus('Your message has been sent. We will respond soon.')
      setContactName('')
      setContactEmail('')
      setContactMessage('')
    } catch {
      setContactError('Unable to send message right now. Please try again later.')
    } finally {
      setContactSubmitting(false)
    }
  }

  const handleInterestToggle = (interest) => {
    setRegInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please enter your full name and email address.')
      setRegStatus('')
      return
    }

    setRegSubmitting(true)
    setRegError('')
    setRegStatus('')

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          type: regType,
          interests: regInterests,
          notes: regNotes.trim(),
        }),
      })

      if (!res.ok) {
        throw new Error('Registration failed')
      }

      const createdMember = await res.json()
      setMembers((prev) => [createdMember, ...prev])
      setRegStatus('Welcome! Your registration has been submitted successfully.')
      setRegName('')
      setRegEmail('')
      setRegPhone('')
      setRegType('Individual')
      setRegInterests([])
      setRegNotes('')
    } catch {
      setRegError('Unable to process registration right now. Please try again.')
    } finally {
      setRegSubmitting(false)
    }
  }

  const renderPage = () => {
    switch (page) {
      case 'about':
        return (
          <section className="page-section">
            <div className="section__heading">
              <p className="eyebrow">About us</p>
              <h2>Serving families with warmth, dignity, and purpose</h2>
            </div>
            <div className="split-grid">
              <article className="panel">
                <h3>Our mission</h3>
                <p>
                  We exist to help neighbours grow in faith, strengthen family bonds,
                  and uplift one another through service and compassion.
                </p>
              </article>
              <article className="panel">
                <h3>What makes us special</h3>
                <p>
                  Our center welcomes people of all backgrounds and offers a safe,
                  inclusive place for learning, prayer, and connection.
                </p>
              </article>
            </div>
          </section>
        )
      case 'events':
        return (
          <section className="page-section">
            <div className="section__heading">
              <p className="eyebrow">Events</p>
              <h2>Join the next gathering with your family</h2>
            </div>
            <div className="event-grid">
              {(siteEvents.length ? siteEvents : events).map((eventItem) => (
                <article className="event" key={eventItem.day}>
                  <h3>{eventItem.day}</h3>
                  <p>{eventItem.detail}</p>
                </article>
              ))}
            </div>
          </section>
        )
      case 'announcements': {
        const list = announcements.length ? announcements : defaultAnnouncements
        const categories = ['All', 'Community Event', 'Volunteer', 'Education', 'Facility']
        const filteredList =
          announcementFilter === 'All'
            ? list
            : list.filter((item) => item.category === announcementFilter)

        return (
          <section className="page-section">
            <div className="section__heading">
              <p className="eyebrow">Updates & News</p>
              <h2>Community Announcements</h2>
            </div>

            <div className="announcement-filter">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn ${announcementFilter === cat ? 'active' : ''}`}
                  onClick={() => setAnnouncementFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="announcements-grid">
              {filteredList.map((ann) => (
                <article
                  className={`announcement-card ${ann.important ? 'important' : ''}`}
                  key={ann.id || ann.title}
                >
                  <div>
                    <div className="announcement-card__meta">
                      {ann.category && <span className="badge">{ann.category}</span>}
                      {ann.important && <span className="badge badge--important">Important</span>}
                      {ann.date && <span className="announcement-card__date">{ann.date}</span>}
                    </div>
                    <h3>{ann.title}</h3>
                    <p>{ann.summary || ann.detail}</p>
                  </div>
                  <div>
                    {ann.category === 'Volunteer' && (
                      <button
                        className="button button--secondary"
                        onClick={() => navigate('register')}
                        type="button"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        Sign Up to Volunteer
                      </button>
                    )}
                    {ann.category === 'Education' && (
                      <button
                        className="button button--secondary"
                        onClick={() => navigate('events')}
                        type="button"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        View Class Schedule
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      }
      case 'donations':
        return (
          <section className="page-section">
            <div className="section__heading">
              <p className="eyebrow">Donations</p>
              <h2>Your support helps sustain programs and outreach</h2>
            </div>
            <div className="split-grid">
              <article className="panel">
                <h3>How donations help</h3>
                <p>
                  Donations fund community meals, youth activities, educational classes,
                  and assistance for families in need.
                </p>
              </article>
              <article className="panel">
                <h3>Ways to give</h3>
                <p>One-time gifts, monthly support, and sponsorships for special events.</p>
              </article>
            </div>
          </section>
        )
      case 'register':
        return (
          <section className="page-section">
            <div className="section__heading">
              <p className="eyebrow">Membership</p>
              <h2>Join the Muslim Community Center</h2>
            </div>
            <div className="contact-grid">
              <form className="panel" onSubmit={handleRegisterSubmit}>
                <label>
                  Full Name *
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </label>
                <label>
                  Email Address *
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </label>
                <label>
                  Membership Type
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value)}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Family">Family</option>
                    <option value="Student">Student</option>
                    <option value="Senior">Senior</option>
                  </select>
                </label>
                <fieldset className="fieldset">
                  <legend>Areas of Interest / Volunteering</legend>
                  {[
                    'Community Service & Food Drive',
                    'Youth Programs & Mentorship',
                    'Event Planning & Logistics',
                    'Educational & Study Circles',
                  ].map((interest) => (
                    <label key={interest} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={regInterests.includes(interest)}
                        onChange={() => handleInterestToggle(interest)}
                      />
                      <span>{interest}</span>
                    </label>
                  ))}
                </fieldset>
                <label>
                  Additional Notes or Questions
                  <textarea
                    rows="3"
                    placeholder="Tell us about yourself..."
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                  />
                </label>
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={regSubmitting}
                >
                  {regSubmitting ? 'Registering…' : 'Complete Registration'}
                </button>
                {regStatus && <p className="status-message">{regStatus}</p>}
                {regError && <p className="error-message">{regError}</p>}
              </form>

              <div className="panel">
                <h3>Member Benefits</h3>
                <ul className="list">
                  <li>Official community updates & newsletters</li>
                  <li>Access to member-only workshops and retreats</li>
                  <li>Volunteer outreach opportunities</li>
                  <li>Youth leadership & educational programs</li>
                </ul>

                {members.length > 0 && (
                  <div className="recent-members">
                    <h4>Registered Members ({members.length})</h4>
                    <ul className="member-list">
                      {members.map((m) => (
                        <li key={m.id || m.email || m.name}>
                          <strong>{m.name}</strong> — {m.type || 'Member'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      case 'contact':
        return (
          <section className="page-section">
            <div className="section__heading">
              <p className="eyebrow">Contact</p>
              <h2>We would love to welcome you</h2>
            </div>
            <div className="contact-grid">
              <form className="panel" onSubmit={handleContactSubmit}>
                <label>
                  Name
                  <input
                    type="text"
                    placeholder="Your name"
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                  />
                </label>
                <label>
                  Message
                  <textarea
                    rows="4"
                    placeholder="Tell us how we can help"
                    value={contactMessage}
                    onChange={(event) => setContactMessage(event.target.value)}
                  />
                </label>
                <button type="submit" className="button button--primary" disabled={contactSubmitting}>
                  {contactSubmitting ? 'Sending…' : 'Send Message'}
                </button>
                {contactStatus && <p className="status-message">{contactStatus}</p>}
                {contactError && <p className="error-message">{contactError}</p>}
              </form>
              <div className="panel">
                <h3>Visit us</h3>
                <p>123 Community Avenue</p>
                <p>Open daily for prayer and support</p>
                <p>Email: hello@muslimcommunity.org</p>
              </div>
            </div>
          </section>
        )
      default:
        return (
          <>
            <header className="hero">
              <div className="hero__content">
                <p className="eyebrow">Community • Faith • Service</p>
                <h1>Welcome to the Muslim Community Center</h1>
                <p className="hero__text">
                  A compassionate place where families grow in faith, find belonging, and
                  serve one another with kindness.
                </p>
                <div className="hero__actions">
                  <button className="button button--primary" onClick={() => navigate('about')}>
                    Learn More
                  </button>
                  <button className="button button--secondary" onClick={() => navigate('register')}>
                    Register / Join Us
                  </button>
                </div>
              </div>

              <aside className="hero__card" aria-label="Today at the center">
                <h2>Today at the Center</h2>
                <ul>
                  <li>Morning Du’a circle at 7:30 AM</li>
                  <li>Community kitchen prep at 11:00 AM</li>
                  <li>Evening reflection session at 6:00 PM</li>
                </ul>
              </aside>
            </header>

            <aside className="announcement-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Latest Announcements</h3>
                <button
                  onClick={() => navigate('announcements')}
                  className="button button--secondary"
                  style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                  type="button"
                >
                  View All Announcements →
                </button>
              </div>
              <ul style={{ marginTop: '10px' }}>
                {(announcements.length ? announcements : defaultAnnouncements)
                  .slice(0, 2)
                  .map((item, idx) => (
                    <li key={item.id || idx}>
                      <strong>{item.title || item}</strong>
                      {(item.summary || item.detail) && ` — ${item.summary || item.detail}`}
                    </li>
                  ))}
              </ul>
            </aside>

            <main>
              <section className="section">
                <div className="section__heading">
                  <p className="eyebrow">Our values</p>
                  <h2>Built around compassion, unity, and shared purpose</h2>
                </div>
                <div className="cards">
                  {pillars.map((pillar) => (
                    <article className="card" key={pillar.title}>
                      <h3>{pillar.title}</h3>
                      <p>{pillar.text}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="section section--alt">
                <div className="section__heading">
                  <p className="eyebrow">Programs</p>
                  <h2>Opportunities to learn, connect, and give back</h2>
                </div>
                <ul className="list">
                  {programs.map((program) => (
                    <li key={program}>{program}</li>
                  ))}
                </ul>
              </section>
            </main>
          </>
        )
    }
  }

  return (
    <div className="page">
      <nav className="top-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item.key}
            className={`nav-link ${page === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
      {renderPage()}
    </div>
  )
}

export default App
