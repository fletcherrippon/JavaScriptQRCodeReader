let codes = [];
const seen = new Set();

// Define custom element
customElements.define('scaned-item', class extends HTMLElement {
  constructor() {
    super();
    const template = document.querySelector('#scaned-item').content
    const shadowRoot = this.attachShadow({mode: 'open'}).appendChild(template.cloneNode(true))
  }
})

// Code proxy
const codesProxy = new Proxy(codes, {
  set (target, prop, value, receiver) {
    if (typeof value === 'number') throw value
    target.push(value)

    target = target.filter((c) => {
      if (c.rawValue !== window.barcodeVal) return c
      const d = seen.has(c.rawValue);
      seen.add(c.rawValue);
      return !d;
    })

    const scaned = document.querySelector('#scaned')
    const temp = document.createElement('scaned-item')
    const format = document.createElement('span')
    const rawValue = document.createElement('span')

    format.setAttribute('slot', 'format')
    format.innerHTML = value.format

    rawValue.setAttribute('slot', 'raw')
    rawValue.innerHTML = value.rawValue

    temp.appendChild(rawValue)
    temp.appendChild(format)

    scaned.appendChild(temp)

    console.log(codes)
    return true
  }
})

const video = document.getElementById('video');

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  const constraints = {
    video: true,
    audio: false
  };
  
  navigator.mediaDevices.getUserMedia(constraints).then(stream => video.srcObject = stream);
}

const barcodeDetector = new BarcodeDetector({formats: ['qr_code']});

const detectCode = () => {
  barcodeDetector.detect(video).then(codes => {
    if (codes.length === 0) return
    
    for (barcode of codes)  {
      drawCodePath(barcode)
      
      if (seen.has(barcode.rawValue)) return
      window.barcodeVal = barcode.rawValue
      codesProxy.push(barcode)
      console.log(barcode)
    }
  }).catch(err => {
    console.error(err);
  })
}

setInterval(() => detectCode(), 100)

// Draw outline to canvas 
const drawCodePath = ({cornerPoints, boundingBox}) => {
  const canvas = document.querySelector('#canvas')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const strokeGradient = ctx.createLinearGradient(0, 0, canvas.scrollWidth, canvas.scrollHeight)

  strokeGradient.addColorStop('0', '#c471ed')
  strokeGradient.addColorStop('1', '#f7797d')

  ctx.strokeStyle = strokeGradient
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let [i, {x, y}] of cornerPoints.entries()) {
    if (i === 0) ctx.moveTo(x, y)
    ctx.lineTo(x, y)
    if (i === cornerPoints.length-1) ctx.lineTo(cornerPoints[0].x, cornerPoints[0].y)
  }
  ctx.stroke();
}
