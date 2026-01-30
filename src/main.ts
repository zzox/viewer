import * as THREE from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let camera:THREE.PerspectiveCamera,
  scene:THREE.Scene,
  renderer:THREE.WebGLRenderer,
  controls:OrbitControls,
  object:THREE.Object3D

const width = 640
const height = 640

const go = async () => {
  // camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20)
  camera.position.z = 2.5

  // scene
  scene = new THREE.Scene()

  const ambientLight = new THREE.AmbientLight(0xffffff)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0xffffff, 15)
  camera.add(pointLight)
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
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  renderer.setAnimationLoop(animate)
  const container = document.querySelector('#container')
  container!.prepend(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.minDistance = 2
  controls.maxDistance = 20

  // window.addEventListener('resize', onWindowResize)
  renderer.domElement.addEventListener('click', clickMe)
}

const clickMe = () => {
  console.log('clicked')
}

let scale = 1

const animate = () => {
  controls.update()
  // scale *= 1.001
  // console.log(scale)
  object.scale.set(scale, scale, scale)

  renderer.render(scene, camera)

  if (Math.random() < 0.01) {
    console.time('asdf')
    const canvas:HTMLCanvasElement = document.querySelector('#twod')!
    const twoDcontext = canvas.getContext('2d')!
    const gl = renderer.getContext()

    for (let i = 0; i < 4; i++) {
      renderer.render(scene, camera)
      twoDcontext.drawImage(gl.canvas, 640 - 32, 640 - 32, 64, 64, i * 64, 0, 64, 64)
      object.rotateY(Math.PI / 2)
    }
    console.timeEnd('asdf')
  }
}

go()
