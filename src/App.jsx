import { useEffect, useState } from 'react'
import './App.css'

const navigation = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'events', label: 'Events' },
  { key: 'donations', label: 'Donations' },
  { key: 'contact', label: 'Contact' },
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
      await new Promise((resolve) => setTimeout(resolve, 500))
      setContactStatus('Your message has been sent. We will respond soon.')
      setContactName('')
      setContactEmail('')
      setContactMessage('')
    } catch (error) {
      setContactError('Unable to send message right now. Please try again later.')
    } finally {
      setContactSubmitting(false)
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
                  <button className="button button--secondary" onClick={() => navigate('contact')}>
                    Join Our Community
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
