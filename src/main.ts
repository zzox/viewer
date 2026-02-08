import * as THREE from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { Wireframe } from 'three/addons/lines/Wireframe.js'
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js'

type Color = [number, number, number]
type PaletteList = Color[]

let camera:THREE.PerspectiveCamera,
  scene:THREE.Scene,
  renderer:THREE.WebGLRenderer,
  controls:OrbitControls,
  object:THREE.Object3D,
  pointLight:THREE.PointLight,
  colors:PaletteList

let targetHeight = 64
let targetWidth = 64
let previewScale = 4
let numAngles = 4

let lightAngle = 0
let lightIntensity = 1
let lightDistance = 2

const width = 128
const height = 128

const target:HTMLDivElement = document.querySelector('#target')!
const canvas:HTMLCanvasElement = document.querySelector('#twod')!

let clicked = false

let wireframe:Wireframe

const viewportScale = 4

target.style.width = `${targetWidth * viewportScale}px`
target.style.height = `${targetHeight * viewportScale}px`

const toRadians = (deg:number) => deg * Math.PI / 180

const updateItems = () => {
  canvas.width = numAngles * targetWidth
  canvas.height = targetHeight
  canvas.style.width = `${canvas.width * previewScale}px`
  canvas.style.height = `${canvas.height * previewScale}px`
  target.style.width = `${targetWidth * viewportScale}px`
  target.style.height = `${targetHeight * viewportScale}px`

  pointLight.intensity = lightIntensity
  const x = Math.cos(toRadians(lightAngle)) * lightDistance
  const y = Math.sin(toRadians(lightAngle)) * lightDistance
  pointLight.position.set(x, lightDistance * .33, y)
  wireframe.position.set(x, lightDistance * .33, y)
  console.log(pointLight.position)
}

const inputParseInt = (selector:string, callback:(n:number) => void) => {
  document.querySelector<HTMLInputElement>(selector)!.onchange = (el) => {
    callback(parseInt(el.currentTarget!.value))
    updateItems()
  }
}

const findColor = (r:number, g:number, b:number, list:PaletteList):[number, number, number] => {
  let best, bestDistance = 16777216
  for (let i = 0; i < list.length; i++) {
    const distance = Math.pow(Math.abs(r - list[i][0]), 2) + Math.pow(Math.abs(g - list[i][1]), 2) + Math.pow(Math.abs(b - list[i][2]), 2)
    if (distance < bestDistance) {
      best = list[i]
      bestDistance = distance
    }
  }

  if (best == null) {
    throw 'None found'
  }

  return best
}

const compareColor = (c1:Color, c2:Color):boolean =>
  c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2]

const removeColor = (color:Color) => {
  for (let i = 0; i < colors.length; i++) {
    if (compareColor(colors[i], color)) {
      colors.splice(i, 1)
      break;
    }
  }
}

const addColor = (color:Color) => {
  colors.push(color)
}

const createPaletteItems = (list:PaletteList) => {
  const itemsContainer = document.querySelector('#palette-items')!
  // itemsContainer.chil
  // remove children

  list.forEach(color => {
    const container = document.createElement('div')
    container.className = 'palette-item'

    const text = document.createElement('p')
    text.textContent = '#' + color.map(i => {
      const item = i.toString(16)
      if (item.length === 0) {
        return '00'
      } else if (item.length === 1) {
        return '0' + item
      }
      return item
    }).join('')

    const box = document.createElement('div')
    box.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
    box.className = 'palette-box'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = true
    checkbox.onclick = () => {
      if (checkbox.checked) {
        addColor(color)
      } else {
        removeColor(color)
      }
    }

    container.appendChild(text)
    container.appendChild(box)
    container.appendChild(checkbox)
    itemsContainer.appendChild(container)
  })
}

const go = async () => {
  // palette snap colors
  const paletteFile = await fetch('./palettes/cgarne-exp.gpl')
  const text = await paletteFile.text()
  const fileLines = text.split('\n')
  if (fileLines[0] !== 'GIMP Palette') {
    console.error('Is this a Gimp Palette?')
  }

  colors = fileLines
    .filter((line, i) => i && line && line[0] !== '#')
    .map(str => str.split('\t'))
    .map(([r, g, b]) => [parseInt(r), parseInt(g), parseInt(b)])

  createPaletteItems(colors)

  // camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20)
  camera.position.z = 2.5

  // scene
  scene = new THREE.Scene()

  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  const geo = new THREE.BoxGeometry(0.25, 0.25, 0.25)
  const geometry = new WireframeGeometry2(geo)
  const matLine = new LineMaterial({
    color: 0x4080ff,
    linewidth: 1, // in pixels
    dashed: false
  })

  wireframe = new Wireframe(geometry, matLine)
  wireframe.computeLineDistances()
  wireframe.scale.set(1, 1, 1)
  scene.add(wireframe )

  pointLight = new THREE.PointLight(0xffffff, 100, 0, 5.0)
  pointLight.position.set(2, 2, 2)
  scene.add(pointLight) // need to add point light to scene not camera
  scene.add(camera)

  // model
  const mtlLoader = new MTLLoader()//.setPath('models')
  const materials = await mtlLoader.loadAsync('./models/rock-2.mtl')
  materials.preload()

  const objLoader = new OBJLoader()//.setPath('models')
  objLoader.setMaterials(materials) // optional since OBJ assets can be loaded without an accompanying MTL file

  object = await objLoader.loadAsync('./models/rock-2.obj')

  object.position.y = - 0.5
  // object.scale.setScalar(0.01)
  scene.add(object)

  console.log(object)

  renderer = new THREE.WebGLRenderer({ /* preserveDrawingBuffer: true, */ /* antialias: false */ })
  // renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  renderer.setAnimationLoop(animate)
  const container = document.querySelector('#container')
  container!.prepend(renderer.domElement)

  renderer.domElement.style.imageRendering = 'pixelated'
  renderer.domElement.style.width = `${width * viewportScale}px`
  renderer.domElement.style.height = `${height * viewportScale}px`

  controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableDamping = true
  // controls.enableZoom = false

  inputParseInt('#target-width', (num => targetWidth = num))
  inputParseInt('#target-height', (num => targetHeight = num))
  inputParseInt('#num-angles', (num => numAngles = num))
  inputParseInt('#preview-scale', (num => previewScale = num))

  inputParseInt("#light-angle", (num => {
    const field = document.querySelector("#light-angle-field")!
    field.textContent = num.toString()
    lightAngle = num
  }))
  inputParseInt("#light-distance", (num => {
    const field = document.querySelector("#light-distance-field")!
    field.textContent = num.toString()
    lightDistance = num
  }))
  inputParseInt("#light-intensity", (num => {
    const field = document.querySelector("#light-intensity-field")!
    field.textContent = num.toString()
    lightIntensity = num
  }))

  // window.addEventListener('resize', onWindowResize)
  renderer.domElement.addEventListener('click', clickMe)
}

const clickMe = () => {
  clicked = true
}

let scale = 1

const animate = () => {
  controls.update()
  // scale *= 1.001
  // console.log(scale)
  object.scale.set(scale, scale, scale)

  renderer.render(scene, camera)

  if (clicked) {
    console.time('render')
    const canvas:HTMLCanvasElement = document.querySelector('#twod')!
    const twoDcontext = canvas.getContext('2d')!
    const gl = renderer.getContext()
    twoDcontext.clearRect(0, 0, targetWidth * numAngles, targetHeight)

    wireframe.visible = false
    for (let i = 0; i < numAngles; i++) {
      renderer.setClearColor(0x000000, 0)
      renderer.clear(true)
      renderer.render(scene, camera)
      twoDcontext.drawImage(gl.canvas,
        width / 2 - targetWidth / 2, height / 2 - targetHeight / 2,
        targetWidth, targetHeight, i * targetWidth, 0, targetWidth, targetHeight
      )
      object.rotateY(Math.PI * 2 / numAngles)
    }
    renderer.setClearColor(0x000000, 1)
    clicked = false
    wireframe.visible = true

    // palette snap
    const imageData = twoDcontext.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const idx = i

      if (data[idx + 3] === 255) {// || colorAllAlpha) {
        const [r, g, b] = findColor(data[idx], data[idx + 1], data[idx + 2], colors)
        data[idx] = r
        data[idx + 1] = g
        data[idx + 2] = b
      } else {
        data[idx] = 0
        data[idx + 1] = 0
        data[idx + 2] = 0
        data[idx + 3] = 0
      }
    }
    twoDcontext.putImageData(imageData, 0, 0)

    console.timeEnd('render')
  }
}

go()
