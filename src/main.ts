import * as THREE from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let camera:THREE.PerspectiveCamera,
  scene:THREE.Scene,
  renderer:THREE.WebGLRenderer,
  controls:OrbitControls

const width = 640
const height = 640

const go = async () => {
  // const canvas:HTMLCanvasElement = document.querySelector('#canvas')!
  // const gl = canvas.getContext('webgl2')
  // if (!gl) {
  //   throw 'No GL Found!'
  // }
		// <script type="importmap">
		// 	{
		// 		"imports": {
		// 			"three": "../build/three.module.js",
		// 			"three/addons/": "./jsm/"
		// 		}
		// 	}
		// </script>

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

  const object = await objLoader.loadAsync('./models/rock-2.obj')

  object.position.y = - 0.5
  // object.scale.setScalar(0.01)
  scene.add(object)

  console.log(object)
  //

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  renderer.setAnimationLoop(animate)
  document.body.appendChild(renderer.domElement)

  //

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.minDistance = 2
  controls.maxDistance = 5

  //

  window.addEventListener('resize', onWindowResize)
}

const onWindowResize = () => {
  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
}

const animate = () => {
  controls.update()

  renderer.render(scene, camera)
}

go()
