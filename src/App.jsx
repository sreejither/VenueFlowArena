import React, { useState, useEffect, useMemo } from 'react'

const ZONES = [
  { id: 'East Entrance', x: 0, y: 0 },
  { id: 'Food Court', x: 1, y: 0 },
  { id: 'Souvenir Shop', x: 1, y: 2 },
  { id: 'Main Arena', x: 0.5, y: 1 },
  { id: 'West Entrance', x: 0, y: 2 },
  { id: 'Vip Lounge', x: 0.5, y: 2 }
]

const GRAPH = {
  'East Entrance': ['Food Court', 'Main Arena'],
  'Food Court': ['East Entrance', 'Main Arena', 'Souvenir Shop'],
  'Souvenir Shop': ['Food Court'],
  'Main Arena': ['East Entrance', 'West Entrance', 'Food Court', 'Vip Lounge'],
  'West Entrance': ['Vip Lounge', 'Main Arena'],
  'Vip Lounge': ['West Entrance', 'Main Arena']
}

// --- Global UI Components ---

const StatusBar = ({ time }) => (
  <div className="status-bar">
    <div>{time}</div>
    <div className="status-icons">
      <span>📶</span>
      <span>5G</span>
      <span>🔋 85%</span>
    </div>
  </div>
)

const GlobalHeader = ({ showBack, title, user, onBack, onProfile }) => (
  <div style={{padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      {showBack && <button className="btn-icon" style={{padding: '6px 10px', cursor: 'pointer'}} onClick={onBack}>←</button>}
      <span style={{fontWeight: 800, fontSize: '1.2rem', cursor: 'pointer'}} onClick={onBack}>{title}</span>
    </div>
    <div className="avatar-mini" style={{cursor: 'pointer'}} onClick={onProfile}>
      {user ? user.name[0] : 'U'}
    </div>
  </div>
)

const ScreenWrapper = ({ children, hideHeader = false, showBack = false, title = "FlowVenue", time, user, setScreen, alert }) => (
  <div className="mobile-shell">
    <StatusBar time={time} />
    {!hideHeader && <GlobalHeader showBack={showBack} title={title} user={user} onBack={() => setScreen('home')} onProfile={() => setScreen('profile')} />}
    {alert && <div className="alert">{alert}</div>}
    <div className="screen-slide-enter" style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
      {children}
    </div>
    <div className="home-indicator"></div>
  </div>
)

// --- Interactive SVG Map Component ---

const StadiumMap = ({ zones, startZone, endZone, currentPath, getStatusColor, onZoneClick }) => {
  // SVG Sector Data logic
  const sectors = [
    { id: 'East Entrance', start: 0, end: 72, labelX: 160, labelY: 100 },
    { id: 'Food Court', start: 72, end: 144, labelX: 130, labelY: 170 },
    { id: 'Souvenir Shop', start: 144, end: 216, labelX: 45, labelY: 155 },
    { id: 'West Entrance', start: 216, end: 288, labelX: 40, labelY: 60 },
    { id: 'Vip Lounge', start: 288, end: 360, labelX: 125, labelY: 45 }
  ]

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ")
  }

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  const getPathForSector = (s, innerR, outerR) => {
    const p1 = polarToCartesian(100, 100, outerR, s.start)
    const p2 = polarToCartesian(100, 100, outerR, s.end)
    const p3 = polarToCartesian(100, 100, innerR, s.end)
    const p4 = polarToCartesian(100, 100, innerR, s.start)
    const largeArc = s.end - s.start <= 180 ? "0" : "1"

    return [
      "M", p1.x, p1.y,
      "A", outerR, outerR, 0, largeArc, 1, p2.x, p2.y,
      "L", p3.x, p3.y,
      "A", innerR, innerR, 0, largeArc, 0, p4.x, p4.y,
      "Z"
    ].join(" ")
  }

  return (
    <div className="map-svg-container">
      <svg viewBox="0 0 200 200" className="stadium-svg">
        {/* Field of Play */}
        <circle cx="100" cy="100" r="28" className="field-grass" />
        <rect x="85" y="80" width="30" height="40" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="5" fill="rgba(255,255,255,0.1)" />

        {/* Main Arena (Inner Ring) */}
        {(() => {
          const zone = zones.find(z => z.id === 'Main Arena')
          const isPath = currentPath.includes('Main Arena')
          const isEnd = endZone === 'Main Arena'
          const occ = zone?.occupancy || 0
          return (
            <path 
              d={describeArc(100, 100, 50, 0, 359.9) + " L 100 100 Z"} // Mock full ring
              fill={getStatusColor(occ)}
              fillOpacity={0.2}
              className={`zone-path ${isPath ? 'active-path' : ''} ${isEnd ? 'destination' : ''}`}
              onClick={() => onZoneClick('Main Arena')}
              style={{ strokeWidth: isPath ? 3 : 1 }}
            />
          )
        })()}
        <text x="100" y="105" textAnchor="middle" className="map-label" style={{fontSize: '7px'}}>Main Arena</text>

        {/* Outer Sectors */}
        {sectors.map(s => {
          const zone = zones.find(z => z.id === s.id)
          const isPath = currentPath.includes(s.id)
          const isEnd = endZone === s.id
          const occ = zone?.occupancy || 0
          
          return (
            <g key={s.id} onClick={() => onZoneClick(s.id)}>
              <path 
                d={getPathForSector(s, 60, 95)}
                fill={getStatusColor(occ)}
                fillOpacity={0.15}
                className={`zone-path ${isPath ? 'active-path' : ''} ${isEnd ? 'destination' : ''}`}
                style={{ strokeWidth: isPath ? 3 : 1 }}
              />
              <text x={s.labelX} y={s.labelY} textAnchor="middle" className="map-label">
                {s.id.split(' ')[0]}
              </text>
            </g>
          )
        })}

        {/* User Location Dot */}
        {startZone && (() => {
          let pos = { x: 100, y: 100 }
          if (startZone === 'Main Arena') pos = { x: 100, y: 115 }
          else {
            const s = sectors.find(sec => sec.id === startZone)
            if (s) pos = polarToCartesian(100, 100, 78, (s.start + s.end) / 2)
          }
          return <circle cx={pos.x} cy={pos.y} r="4" className="user-dot" />
        })()}
      </svg>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('auth')
  const [user, setUser] = useState(null)
  const [ticketId, setTicketId] = useState('')
  const [zones, setZones] = useState(
    ZONES.map(z => ({ ...z, occupancy: Math.floor(Math.random() * 30) + 10 }))
  )
  const [startZone, setStartZone] = useState(null)
  const [endZone, setEndZone] = useState(null)
  const [alert, setAlert] = useState(null)
  const [userCount, setUserCount] = useState(14302)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [hasArrived, setHasArrived] = useState(false)

  // System Time
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Congestion-Aware Pathfinding (Dijkstra's Algorithm)
  const currentPath = useMemo(() => {
    if (!startZone || !endZone) return []
    if (startZone === endZone) return [startZone]

    // Determine weight/cost to enter a zone based on live congestion
    const getCost = (zoneId) => {
      const zone = zones.find(z => z.id === zoneId)
      const occ = zone ? zone.occupancy : 0
      // Base walking cost is 1. High occupancy exponentially increases the 'time' cost
      if (occ > 80) return 50 // Severe bottleneck, avoid at all costs
      if (occ > 60) return 10 // Heavy traffic
      if (occ > 40) return 3  // Medium traffic
      return 1 // Clear path
    }

    const distances = {}
    const previous = {}
    let unvisited = Object.keys(GRAPH)

    unvisited.forEach(node => {
      distances[node] = Infinity
      previous[node] = null
    })
    distances[startZone] = 0

    while (unvisited.length > 0) {
      let currNode = null
      let minDistance = Infinity
      
      // Select unvisited node with lowest distance
      unvisited.forEach(node => {
        if (distances[node] < minDistance) {
          minDistance = distances[node]
          currNode = node
        }
      })

      if (!currNode || distances[currNode] === Infinity) break
      if (currNode === endZone) break

      unvisited = unvisited.filter(node => node !== currNode)

      GRAPH[currNode].forEach(neighbor => {
        if (unvisited.includes(neighbor)) {
          const cost = getCost(neighbor)
          const newDist = distances[currNode] + cost
          if (newDist < distances[neighbor]) {
            distances[neighbor] = newDist
            previous[neighbor] = currNode
          }
        }
      })
    }

    const path = []
    let curr = endZone
    while (curr) {
      path.unshift(curr)
      curr = previous[curr]
    }
    
    if (path[0] !== startZone) return []
    return path
  }, [startZone, endZone, zones])

  // Dynamic Travel Time Estimation
  const estTravelTime = useMemo(() => {
    if (currentPath.length < 2) return 0;
    let time = 0;
    currentPath.forEach((zoneId, idx) => {
      if (idx === 0) return; // Ignore start zone cost
      const zone = zones.find(z => z.id === zoneId)
      const occ = zone ? zone.occupancy : 0
      // Base time between nodes is 2 mins + extra time for crowding
      time += 2 + (occ * 0.05);
    })
    return Math.floor(time);
  }, [currentPath, zones])

  const handleLogin = () => {
    if (ticketId.length > 3) {
      setUser({
        name: "Alex Johnson",
        status: "Platinum Fan",
        id: ticketId,
        seat: "SEC 102, ROW J, SEAT 14",
        savedTime: 124
      })
      setScreen('home')
    } else {
      setAlert("Please enter a valid Ticket ID")
      setTimeout(() => setAlert(null), 2000)
    }
  }

  const detectLocation = () => {
    setScreen('detect')
    setTimeout(() => {
      const randomZone = ZONES[Math.floor(Math.random() * ZONES.length)].id
      setStartZone(randomZone)
      setScreen('select_end')
    }, 2500)
  }

  const getStatusColor = (occ) => {
    if (occ < 40) return 'var(--color-safe)'
    if (occ < 75) return 'var(--color-warning)'
    return 'var(--color-danger)'
  }

  const handleSOS = () => {
    setAlert("🆘 Emergency Signal Received. Security moving to " + (startZone || "your area"))
    setTimeout(() => setAlert(null), 5000)
  }

  if (screen === 'auth') {
    return (
      <ScreenWrapper hideHeader time={time} user={user} setScreen={setScreen} alert={alert}>
        <div className="screen" style={{justifyContent: 'center', textAlign: 'center'}}>
          <h1 className="brand-logo" style={{fontSize: '2.5rem'}}>FlowVenue</h1>
          <p style={{color: 'var(--text-secondary)'}}>Secure Fan Intelligence Entry</p>
          <div className="auth-form">
            <input className="input-field" placeholder="Enter Ticket ID" value={ticketId} onChange={(e) => setTicketId(e.target.value)} autoFocus />
            <button className="btn-primary" style={{width: '100%'}} onClick={handleLogin}>Access Venue</button>
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  if (screen === 'profile') {
    return (
      <ScreenWrapper showBack title="Fan Hub" time={time} user={user} setScreen={setScreen} alert={alert}>
        <div className="screen">
          <div className="profile-header">
            <div className="avatar-large">{user?.name[0]}</div>
            <div>
              <h2 style={{fontSize: '1.5rem'}}>{user?.name}</h2>
              <span className="badge-live" style={{fontSize: '0.6rem', marginTop: 4}}>{user?.status}</span>
            </div>
          </div>
          <div style={{display: 'flex', gap: 12, marginBottom: 24}}>
            <div className="seat-tag" style={{flex: 1}}>
              <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>YOUR SEAT</span>
              <span className="seat-value">{user?.seat.split(',')[0]}</span>
            </div>
            <div className="seat-tag" style={{flex: 1}}>
              <span style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>TIME SAVED</span>
              <span className="seat-value">{user?.savedTime}m</span>
            </div>
          </div>
          <button className="btn-icon" style={{marginTop: 'auto', width: '100%', padding: 20, color: 'var(--color-danger)'}} onClick={() => setScreen('auth')}>Log Out</button>
        </div>
      </ScreenWrapper>
    )
  }

  if (screen === 'home') {
    return (
      <ScreenWrapper hideHeader time={time} user={user} setScreen={setScreen} alert={alert}>
        <div className="screen home-screen">
          <div className="header" style={{position: 'absolute', top: 0, left: 0, width: '100%', padding: '24px', display: 'flex', justifyContent: 'space-between'}}>
            <h3 style={{fontWeight: 800}}>FlowVenue</h3>
            <div className="avatar-mini" onClick={() => setScreen('profile')}>{user?.name[0]}</div>
          </div>
          <h1 className="brand-logo">Hello, {user?.name.split(' ')[0]}</h1>
          <p style={{color: 'var(--text-secondary)', marginBottom: 5, fontSize: '0.9rem', fontWeight: 600}}>GREENFIELD INTERNATIONAL STADIUM</p>
          <p className="brand-tagline">Global Crowd Intelligence Network</p>
          <div style={{marginBottom: 40, background: 'rgba(99, 102, 241, 0.1)', padding: '12px 24px', borderRadius: 20}}>
            <span style={{fontSize: '1.2rem', fontWeight: 800}}>{userCount.toLocaleString()}</span>
            <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 8}}>Connected Fans</span>
          </div>
          <button className="btn-primary" onClick={() => setScreen('agreement')}>Enter Venue</button>
        </div>
      </ScreenWrapper>
    )
  }

  if (screen === 'agreement') {
    return (
      <ScreenWrapper showBack title="Security Mesh" time={time} user={user} setScreen={setScreen} alert={alert}>
        <div className="screen">
          <h2 style={{fontSize: '1.8rem', fontWeight: 800}}>Safety Network</h2>
          <div className="agreement-card">
            <ul className="agreement-list">
              <li>Anonymous location sharing</li>
              <li>Live crowd density analysis</li>
              <li>Rapid emergency response</li>
            </ul>
          </div>
          <button className="btn-primary" style={{marginTop: 'auto', width: '100%'}} onClick={detectLocation}>I Agree & Proceed</button>
        </div>
      </ScreenWrapper>
    )
  }

  if (screen === 'detect') {
    return (
      <ScreenWrapper hideHeader time={time} user={user} setScreen={setScreen} alert={alert}>
        <div className="screen" style={{justifyContent: 'center'}}>
          <div className="radar-box">
            <div className="radar-ring"></div>
            <h2 style={{marginTop: 40, fontWeight: 300}}>Pinpointing Section...</h2>
            <p style={{color: 'var(--color-primary)', marginTop: 8, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '1px'}}>GREENFIELD INTERNATIONAL STADIUM</p>
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  if (screen === 'select_end') {
    return (
      <ScreenWrapper showBack title="Destination" time={time} user={user} setScreen={setScreen} alert={alert}>
        <div className="screen">
          <p style={{marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Tap a zone on the map or select from the list:</p>
          
          <StadiumMap 
            zones={zones} 
            startZone={startZone}
            endZone={endZone}
            currentPath={currentPath}
            getStatusColor={getStatusColor}
            onZoneClick={(id) => {setEndZone(id); setScreen('nav')}}
          />

          <div className="select-container" style={{marginTop: 16}}>
            {ZONES.map(z => (
              <div key={z.id} className="list-item" onClick={() => {setEndZone(z.id); setScreen('nav')}}>
                <div>
                  <div style={{fontWeight: 600}}>{z.id}</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{z.id === user?.seat.split(',')[0].replace('SEC ', 'Zone ') ? 'Your Seat Area' : 'Public Facility'}</div>
                </div>
                <div style={{color: getStatusColor(zones.find(zone => zone.id === z.id).occupancy), fontWeight: 700}}>{zones.find(zone => zone.id === z.id).occupancy}%</div>
              </div>
            ))}
          </div>
        </div>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper hideHeader time={time} user={user} setScreen={setScreen} alert={alert}>
      <div className="screen" style={{padding: 0, position: 'relative'}}>
        {hasArrived && (
          <div className="arrival-overlay">
            <div className="confetti-mock">🎉</div>
            <h2 style={{fontSize: '2rem', fontWeight: 800}}>You've Arrived!</h2>
            <p style={{color: 'var(--text-secondary)', marginTop: 12, marginBottom: 40}}>Fastest route optimization saved you 3.4m.</p>
            <button className="btn-primary" style={{width: '240px'}} onClick={() => {setHasArrived(false); setScreen('home')}}>Done & Return Home</button>
          </div>
        )}

        {showAnalytics && (
          <div style={{position: 'absolute', inset: 0, zIndex: 1000, background: 'var(--bg-color)', padding: 24, display: 'flex', flexDirection: 'column'}}>
            <div className="header"><h3>Venue Analytics</h3><button className="btn-icon" onClick={() => setShowAnalytics(false)}>Close</button></div>
            <div className="stat-box">
              <span className="stat-value">{userCount.toLocaleString()}</span>
              <span className="stat-label">Total Connected Devices</span>
            </div>
            <div className="bottleneck-alert">⚠️ Multiple users reporting bottleneck near <strong>Food Court</strong>.</div>
            <button className="btn-primary" style={{marginTop: 'auto', width: '100%'}} onClick={() => setShowAnalytics(false)}>Back to Guidance</button>
          </div>
        )}

        <div style={{padding: 24, paddingBottom: 0}}>
          <div className="header" style={{alignItems: 'flex-start'}}>
            <div>
              <div style={{fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 800, letterSpacing: '1px', marginBottom: 4}}>NAVIGATING TO</div>
              <div style={{fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.2}}>📍 {endZone}</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4}}>Starting from {startZone}</div>
            </div>
            <button className="btn-icon" onClick={() => setShowAnalytics(true)}>Stats</button>
          </div>

          <StadiumMap 
            zones={zones} 
            startZone={startZone}
            endZone={endZone}
            currentPath={currentPath}
            getStatusColor={getStatusColor}
            onZoneClick={() => {}} 
          />
        </div>

        <div className="panel" style={{marginTop: 'auto', position: 'relative'}}>
          <button className="btn-sos" style={{position: 'absolute', top: -70, right: 24}} onClick={handleSOS}>🆘</button>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
            <div>
              <div style={{fontSize: '1.2rem', fontWeight: 700}}>{estTravelTime > 0 ? estTravelTime : '<1'}m</div>
              <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>EST. TRAVEL</div>
            </div>
            <button className="btn-primary" style={{height: '48px', width: '120px', fontSize: '0.9rem'}} onClick={() => setHasArrived(true)}>Arrived</button>
          </div>
          <div style={{position: 'absolute', bottom: 120, left: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8}}>
            <div style={{background: 'rgba(99, 102, 241, 0.2)', backdropFilter: 'blur(8px)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', maxWidth: '200px'}}>
              <span style={{color: 'var(--text-secondary)', fontWeight: 600}}>ROUTE:</span> {currentPath.join(' ➔ ')}
            </div>
            <div className="badge-live" style={{background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid var(--surface-border)', width: 'fit-content'}}>
              <div className="sharing-pulse" style={{backgroundColor: '#fff'}}></div>
              Active Peer Mesh Optimization
            </div>
          </div>
        </div>
      </div>
    </ScreenWrapper>
  )
}

export default App
