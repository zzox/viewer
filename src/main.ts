import * as THREE from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { Wireframe } from 'three/addons/lines/Wireframe.js'
import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js'

let camera:THREE.PerspectiveCamera,
  scene:THREE.Scene,
  renderer:THREE.WebGLRenderer,
  controls:OrbitControls,
  object:THREE.Object3D,
  pointLight:THREE.PointLight

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

const go = async () => {
  // camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20)
  camera.position.z = 2.5

  // scene
  scene = new THREE.Scene()

  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  const geo = new THREE.BoxGeometry( 0.25, 0.25, 0.25 );
  const geometry = new WireframeGeometry2( geo );
  const matLine = new LineMaterial({
    color: 0x4080ff,
    linewidth: 1, // in pixels
    dashed: false
  });

  wireframe = new Wireframe( geometry, matLine );
  wireframe.computeLineDistances();
  wireframe.scale.set( 1, 1, 1 );
  scene.add( wireframe );

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

  inputParseInt("#light-angle", (num => lightAngle = num))
  inputParseInt("#light-distance", (num => lightDistance = num))
  inputParseInt("#light-intensity", (num => lightIntensity = num))

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
    console.time('asdf')
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
    console.timeEnd('asdf')
  }
}

go()
