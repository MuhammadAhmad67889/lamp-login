// Lamp Login — plain JavaScript, no framework.
// The lamp is the switch: pull the cord and the room lights up,
// and only then does the login card appear.

// ---- What we need from the page ----

const room = document.getElementById('room')
const shade = document.getElementById('shadeGroup')
const cord = document.getElementById('cord')
const tooltip = document.getElementById('tooltip')
const wallGlow = document.querySelector('.wall-glow')
const lightCone = document.getElementById('lightCone')
const bulbGlow = document.getElementById('bulbGlow')
const bulb = document.getElementById('bulb')
const mouthHot = document.getElementById('mouthHot')
const card = document.getElementById('card')
const cardTitle = document.getElementById('cardTitle')
const cardSub = document.getElementById('cardSub')
const tabSignIn = document.getElementById('tabSignIn')
const tabSignUp = document.getElementById('tabSignUp')
const form = document.getElementById('authForm')
const passwordInput = document.getElementById('password')
const eyeButton = document.getElementById('eyeButton')
const eyeOpen = document.getElementById('eyeOpen')
const eyeClosed = document.getElementById('eyeClosed')
const submitButton = document.getElementById('submitButton')
const demoNote = document.getElementById('demoNote')
const forgotLink = document.getElementById('forgotLink')

// ---- State ----

let isOn = false
let hasPulled = false
let colorIndex = 0

// The three light colours, in the order the shade cycles through them.
// One CSS variable (--accent) carries the colour to the glow, the bulb
// and the whole form, so they always match.
const COLORS = [
  { name: 'warm', value: '#f0a832' },
  { name: 'pink', value: '#f43f7d' },
  { name: 'white', value: '#dcebfb' },
]

// Animations run through GSAP unless the CDN failed or the user
// asked for reduced motion. Either way the lamp must still work,
// so every animated change has a plain instant version.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const canAnimate = typeof window.gsap !== 'undefined' && !reducedMotion
const gsap = window.gsap

// On a phone the card slides up instead of in from the side,
// because the layout stacks. Match the media query in style.css.
function slideOffset() {
  const phone = window.matchMedia('(max-width: 720px)').matches
  return phone ? { x: 0, y: 16 } : { x: 24, y: 0 }
}

// ---- The hum (Web Audio, exactly like the video) ----

let audioCtx = null

function playHum() {
  try {
    // Created on the first gesture: browsers block audio before that.
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      audioCtx = new AudioContext()
    }
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const now = audioCtx.currentTime
    const hum = audioCtx.createOscillator()
    const humGain = audioCtx.createGain()
    hum.type = 'sine'
    hum.frequency.setValueAtTime(120, now + 0.05)
    humGain.gain.setValueAtTime(0.001, now)
    humGain.gain.linearRampToValueAtTime(0.06, now + 0.08)
    humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    hum.connect(humGain)
    humGain.connect(audioCtx.destination)
    hum.start(now + 0.05)
    hum.stop(now + 0.38)
  } catch (error) {
    // Sound is a garnish. If it fails, the lamp still works.
  }
}

// ---- Turning the lamp on and off ----

function toggleLamp(turnOn) {
  isOn = turnOn
  if (turnOn) {
    hideTooltip()
    playHum()
    setShadeAngle(-22)
    setLight(true)
    showCard()
  } else {
    setShadeAngle(-30)
    setLight(false)
    hideCard()
  }
}

// The shade tilts a little when it turns on, around the head joint.
function setShadeAngle(angle) {
  if (canAnimate) {
    gsap.to(shade, {
      rotation: angle,
      svgOrigin: '205 165',
      duration: 0.6,
      ease: 'elastic.out(1, 0.55)',
    })
  } else {
    shade.setAttribute('transform', `translate(205 165) rotate(${angle})`)
  }
}

// The wall glow, the light cone, the bulb and the inside of the shade.
function setLight(on) {
  const wallOpacity = on ? 0.35 : 0
  const coneOpacity = on ? 0.7 : 0
  const bulbOpacity = on ? 0.9 : 0
  const mouthOpacity = on ? 0.95 : 0
  const bulbFill = on ? '#fff3cf' : '#3a3a3a'

  if (canAnimate) {
    gsap.to(wallGlow, { opacity: wallOpacity, duration: 0.8 })
    gsap.to(lightCone, { opacity: coneOpacity, duration: 0.8 })
    gsap.to(bulbGlow, { opacity: bulbOpacity, duration: 0.8 })
    gsap.to(mouthHot, { attr: { 'stop-opacity': mouthOpacity }, duration: 0.8 })
  } else {
    wallGlow.style.opacity = wallOpacity
    lightCone.setAttribute('opacity', coneOpacity)
    bulbGlow.setAttribute('opacity', bulbOpacity)
    mouthHot.setAttribute('stop-opacity', mouthOpacity)
  }
  bulb.setAttribute('fill', bulbFill)
}

// The card only exists while the lamp is on.
function showCard() {
  card.classList.add('on')
  card.style.visibility = 'visible'
  if (canAnimate) {
    gsap.to(card, { opacity: 1, x: 0, y: 0, duration: 0.6, ease: 'power2.out' })
  } else {
    card.style.opacity = 1
    card.style.transform = 'translate(0, 0)'
  }
}

function hideCard() {
  card.classList.remove('on')
  const offset = slideOffset()
  if (canAnimate) {
    gsap.to(card, {
      opacity: 0,
      x: offset.x,
      y: offset.y,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        card.style.visibility = 'hidden'
      },
    })
  } else {
    card.style.opacity = 0
    card.style.transform = `translate(${offset.x}px, ${offset.y}px)`
    card.style.visibility = 'hidden'
  }
}

// The "Pull to turn on" hint is only needed once.
function hideTooltip() {
  if (hasPulled) return
  hasPulled = true
  if (canAnimate) {
    gsap.to(tooltip, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        tooltip.style.display = 'none'
      },
    })
  } else {
    tooltip.style.display = 'none'
  }
}

// ---- The pull cord ----

let dragStartY = 0
let dragDistance = 0
let dragging = false

function moveCord(distance) {
  if (canAnimate) {
    gsap.set(cord, { y: distance })
  } else {
    cord.setAttribute('transform', `translate(0 ${distance})`)
  }
}

function springCordBack() {
  if (canAnimate) {
    gsap.to(cord, { y: 0, duration: 0.9, ease: 'elastic.out(1.2, 0.35)' })
  } else {
    cord.setAttribute('transform', 'translate(0 0)')
  }
}

cord.addEventListener('pointerdown', (event) => {
  dragging = true
  dragStartY = event.clientY
  dragDistance = 0
  cord.setPointerCapture(event.pointerId)
  cord.style.cursor = 'grabbing'
})

cord.addEventListener('pointermove', (event) => {
  if (!dragging) return
  // Only downwards, and never further than the cord can stretch.
  dragDistance = Math.max(0, Math.min(30, event.clientY - dragStartY))
  moveCord(dragDistance)
})

cord.addEventListener('pointerup', () => {
  if (!dragging) return
  dragging = false
  cord.style.cursor = 'grab'
  const pulledFar = dragDistance >= 14
  const tapped = dragDistance < 4
  springCordBack()
  // A real pull, or a plain click on the handle, flips the switch.
  if (pulledFar || tapped) toggleLamp(!isOn)
})

cord.addEventListener('pointercancel', () => {
  dragging = false
  cord.style.cursor = 'grab'
  springCordBack()
})

// Keyboard: the cord is a button too.
cord.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleLamp(!isOn)
  }
})

// ---- Changing the light colour ----

function setAccent(color) {
  if (canAnimate) {
    gsap.to(document.documentElement, { '--accent': color, duration: 0.5 })
  } else {
    document.documentElement.style.setProperty('--accent', color)
  }
}

function cycleColor() {
  colorIndex = (colorIndex + 1) % COLORS.length
  setAccent(COLORS[colorIndex].value)
  // A small nudge on the shade so the click feels answered.
  if (canAnimate) {
    gsap.fromTo(shade, { rotation: -24 }, { rotation: -22, duration: 0.5, ease: 'elastic.out(1, 0.5)', svgOrigin: '205 165' })
  }
}

// A plain click on the shade (not a drag) changes the colour.
let shadePressStart = null
shade.addEventListener('pointerdown', (event) => {
  shadePressStart = { x: event.clientX, y: event.clientY }
})
shade.addEventListener('pointerup', (event) => {
  if (!shadePressStart) return
  const moved = Math.hypot(event.clientX - shadePressStart.x, event.clientY - shadePressStart.y)
  shadePressStart = null
  if (moved < 6) cycleColor()
})

shade.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    cycleColor()
  }
})

// ---- The form ----

const COPY = {
  signin: {
    title: 'Welcome',
    sub: 'Sign in to continue to your account',
    submit: 'Sign In \u2192',
  },
  signup: {
    title: 'Sign Up',
    sub: 'Create an account to get started',
    submit: 'Create Account \u2192',
  },
}

let mode = 'signin'

function switchMode(nextMode) {
  mode = nextMode
  const copy = COPY[mode]
  tabSignIn.classList.toggle('active', mode === 'signin')
  tabSignUp.classList.toggle('active', mode === 'signup')
  tabSignIn.setAttribute('aria-selected', mode === 'signin')
  tabSignUp.setAttribute('aria-selected', mode === 'signup')
  cardTitle.textContent = copy.title
  cardSub.textContent = copy.sub
  submitButton.innerHTML = copy.submit
  demoNote.hidden = true

  if (canAnimate) {
    gsap.fromTo(cardTitle, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 })
  }
}

tabSignIn.addEventListener('click', () => switchMode('signin'))
tabSignUp.addEventListener('click', () => switchMode('signup'))

// Show or hide the password.
eyeButton.addEventListener('click', () => {
  const showing = passwordInput.type === 'text'
  passwordInput.type = showing ? 'password' : 'text'
  eyeOpen.style.display = showing ? '' : 'none'
  eyeClosed.style.display = showing ? 'none' : ''
  eyeButton.setAttribute('aria-label', showing ? 'Show password' : 'Hide password')
  passwordInput.focus()
})

// This is a front-end demo with no backend. Submitting must never
// pretend to log anyone in, so it only shows an honest note.
function showDemoNote(message) {
  demoNote.textContent = message
  demoNote.hidden = false
  if (canAnimate) {
    gsap.fromTo(demoNote, { opacity: 0 }, { opacity: 1, duration: 0.4 })
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  showDemoNote('Demo only \u2014 no account is created.')
})

forgotLink.addEventListener('click', () => {
  showDemoNote('Demo only \u2014 password reset is not wired up.')
})

// The social buttons are decorative in this demo.
document.querySelectorAll('.social').forEach((button) => {
  button.addEventListener('click', () => {
    showDemoNote('Demo only \u2014 no account is created.')
  })
})
