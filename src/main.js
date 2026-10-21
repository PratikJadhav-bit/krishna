import './style.css'

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="scene">

    <canvas id="canvas"></canvas>

    <div class="intro">
      <div class="core"></div>
      <p>Divine energy awakening</p>
    </div>

    <div class="progress">
      <span id="percent">0%</span>
    </div>

    <div class="final">
      <div class="om">ॐ</div>
      <h1>श्री राधा कृष्ण</h1>
      <p>॥ राधे कृष्ण ॥</p>
    </div>

    <button id="restart">↻ Reveal Again</button>

  </div>
`

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const image = new Image()
image.src = '/krishna.jpg'

const percent = document.getElementById('percent')

let particles = []
let animationId

let W
let H

let imageX
let imageY
let imageW
let imageH

let startTime = 0

/*
====================================================
SETUP
====================================================
*/

function setup() {

  W = canvas.width = window.innerWidth
  H = canvas.height = window.innerHeight

  ctx.clearRect(0, 0, W, H)

  /*
  Fit image nicely inside screen
  */

  const scale = Math.min(
    (W * 0.82) / image.width,
    (H * 0.82) / image.height
  )

  imageW = image.width * scale
  imageH = image.height * scale

  imageX = (W - imageW) / 2
  imageY = (H - imageH) / 2

  /*
  Temporary canvas to read image pixels
  */

  const tempCanvas = document.createElement('canvas')

  tempCanvas.width = image.width
  tempCanvas.height = image.height

  const tempCtx =
    tempCanvas.getContext('2d')

  tempCtx.drawImage(
    image,
    0,
    0
  )

  const pixels =
    tempCtx.getImageData(
      0,
      0,
      image.width,
      image.height
    ).data

  particles = []

  /*
  ==================================================
  PARTICLE DENSITY

  2 = MANY particles
  3 = balanced
  4 = fewer particles

  Use 2 for a very detailed image.
  ==================================================
  */

  const STEP = 2

  for (
    let y = 0;
    y < image.height;
    y += STEP
  ) {

    for (
      let x = 0;
      x < image.width;
      x += STEP
    ) {

      const index =
        (y * image.width + x) * 4

      const r = pixels[index]
      const g = pixels[index + 1]
      const b = pixels[index + 2]
      const a = pixels[index + 3]

      if (a < 80) continue

      /*
      Skip almost completely black background.
      */

      const brightness =
        (r + g + b) / 3

      if (brightness < 12) continue

      /*
      FINAL POSITION
      */

      const targetX =
        imageX + x * scale

      const targetY =
        imageY + y * scale

      /*
      START POSITION

      Every particle starts somewhere
      around the entire screen.
      */

      const angle =
        Math.random() *
        Math.PI * 2

      const distance =
        Math.max(W, H) *
        (0.35 + Math.random() * 1.2)

      const startX =
        W / 2 +
        Math.cos(angle) *
        distance

      const startY =
        H / 2 +
        Math.sin(angle) *
        distance

      particles.push({

        /*
        Current position
        */

        x: startX,
        y: startY,

        /*
        Target position
        */

        targetX,
        targetY,

        /*
        Original color
        */

        r,
        g,
        b,

        /*
        Particle size
        */

        size:
          Math.random() * 1.4 + 0.5,

        /*
        Random delay
        */

        delay:
          Math.random() * 3500,

        /*
        Slight random curve
        */

        curveX:
          (Math.random() - .5) * 180,

        curveY:
          (Math.random() - .5) * 180,

        progress: 0
      })
    }
  }

  /*
  Shuffle particles.

  This makes the image form organically
  instead of row-by-row.
  */

  particles.sort(
    () => Math.random() - .5
  )
}


/*
====================================================
EASING
====================================================
*/

function easeInOut(t) {

  return t < .5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2
}


/*
====================================================
DRAW PARTICLE
====================================================
*/

function drawParticle(p) {

  const t =
    Math.max(
      0,
      Math.min(
        1,
        p.progress
      )
    )

  const eased =
    easeInOut(t)

  /*
  Curved path.

  This makes particles swirl slightly
  while travelling toward their position.
  */

  const curve =
    Math.sin(t * Math.PI)

  const x =
    p.x +
    (p.targetX - p.x) * eased +
    p.curveX * curve * .08

  const y =
    p.y +
    (p.targetY - p.y) * eased +
    p.curveY * curve * .08

  /*
  Glow gets stronger near destination.
  */

  const glow =
    5 + eased * 12

  ctx.shadowBlur = glow

  ctx.shadowColor =
    `rgb(${p.r},${p.g},${p.b})`

  ctx.beginPath()

  ctx.arc(
    x,
    y,
    p.size,
    0,
    Math.PI * 2
  )

  ctx.fillStyle =
    `rgba(
      ${p.r},
      ${p.g},
      ${p.b},
      ${0.35 + eased * .65}
    )`

  ctx.fill()

  ctx.shadowBlur = 0
}


/*
====================================================
GOLDEN PARTICLE TRAIL
====================================================
*/

function drawGoldenParticle() {

  /*
  Find the particle currently
  closest to being completed.
  */

  let active = null

  let bestProgress = -1

  for (const p of particles) {

    if (
      p.progress < 1 &&
      p.progress > bestProgress
    ) {

      bestProgress =
        p.progress

      active = p
    }
  }

  if (!active) return

  const t =
    easeInOut(
      Math.max(
        0,
        Math.min(
          1,
          active.progress
        )
      )
    )

  const curve =
    Math.sin(
      active.progress *
      Math.PI
    )

  const x =
    active.x +
    (active.targetX - active.x) *
    t +
    active.curveX *
    curve *
    .08

  const y =
    active.y +
    (active.targetY - active.y) *
    t +
    active.curveY *
    curve *
    .08

  /*
  Large golden glow
  */

  const gradient =
    ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      70
    )

  gradient.addColorStop(
    0,
    'rgba(255,255,220,.9)'
  )

  gradient.addColorStop(
    .15,
    'rgba(255,220,100,.5)'
  )

  gradient.addColorStop(
    .5,
    'rgba(255,160,30,.15)'
  )

  gradient.addColorStop(
    1,
    'rgba(255,100,0,0)'
  )

  ctx.fillStyle = gradient

  ctx.beginPath()

  ctx.arc(
    x,
    y,
    70,
    0,
    Math.PI * 2
  )

  ctx.fill()

  /*
  Golden core
  */

  ctx.shadowBlur = 35

  ctx.shadowColor =
    '#ffd45a'

  ctx.beginPath()

  ctx.arc(
    x,
    y,
    3.5,
    0,
    Math.PI * 2
  )

  ctx.fillStyle =
    '#fff9d6'

  ctx.fill()

  ctx.shadowBlur = 0
}


/*
====================================================
ANIMATION
====================================================
*/

function animate(timestamp) {

  /*
  Time since animation started
  */

  const elapsed =
    timestamp - startTime

  /*
  Dark background
  */

  ctx.fillStyle =
    'rgba(2,3,10,.18)'

  ctx.fillRect(
    0,
    0,
    W,
    H
  )

  /*
  ==================================================
  MOVE PARTICLES
  ==================================================
  */

  let completed = 0

  for (const p of particles) {

    /*
    Each particle starts at a different time.

    This creates the "thousands of particles
    coming together" effect.
    */

    const localTime =
      elapsed - p.delay

    if (localTime > 0) {

      /*
      5.5 seconds travel time
      */

      p.progress =
        Math.min(
          1,
          localTime / 5500
        )
    }

    if (p.progress >= 1) {
      completed++
    }

    drawParticle(p)
  }

  /*
  Golden active particle
  */

  drawGoldenParticle()

  /*
  Percentage
  */

  const percentage =
    Math.floor(
      completed /
      particles.length *
      100
    )

  percent.textContent =
    `${percentage}%`

  /*
  Continue
  */

  if (completed < particles.length) {

    animationId =
      requestAnimationFrame(
        animate
      )

  } else {

    finish()
  }
}


/*
====================================================
FINISH
====================================================
*/

function finish() {

  /*
  Final subtle sharpening
  */

  setTimeout(() => {

    ctx.globalAlpha = .15

    ctx.drawImage(
      image,
      imageX,
      imageY,
      imageW,
      imageH
    )

    ctx.globalAlpha = 1

  }, 600)

  document
    .querySelector('.intro')
    .classList.add('hide')

  document
    .querySelector('.progress')
    .classList.add('hide')

  document
    .querySelector('.final')
    .classList.add('show')
}


/*
====================================================
START
====================================================
*/

function start() {

  cancelAnimationFrame(
    animationId
  )

  document
    .querySelector('.intro')
    .classList.remove('hide')

  document
    .querySelector('.progress')
    .classList.remove('hide')

  document
    .querySelector('.final')
    .classList.remove('show')

  setup()

  /*
  Give the viewer a moment
  to see the single initial dot.
  */

  setTimeout(() => {

    startTime =
      performance.now()

    animationId =
      requestAnimationFrame(
        animate
      )

  }, 1200)
}


/*
====================================================
BUTTON
====================================================
*/

document
  .getElementById('restart')
  .addEventListener(
    'click',
    start
  )


/*
====================================================
IMAGE LOAD
====================================================
*/

image.onload = () => {

  start()
}


/*
====================================================
RESIZE
====================================================
*/

window.addEventListener(
  'resize',
  () => {

    start()
  }
)