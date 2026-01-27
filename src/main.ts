import * as THREE from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

let camera:THREE.PerspectiveCamera,
  scene:THREE.Scene,
  renderer:THREE.WebGLRenderer,
  // bgRenderer:THREE.WebGLRenderer,
  // rt:THREE.WebGLRenderTarget,
  controls:OrbitControls,
  object:THREE.Object3D

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

  object = await objLoader.loadAsync('./models/rock-2.obj')

  object.position.y = - 0.5
  // object.scale.setScalar(0.01)
  scene.add(object)

  console.log(object)
  //

  renderer = new THREE.WebGLRenderer({  preserveDrawingBuffer: true, antialias: false })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  renderer.setAnimationLoop(animate)
  document.body.appendChild(renderer.domElement)

  // rt = new THREE.WebGLRenderTarget()
  // rt.setSize(256, 256)
  // bgRenderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true })
  // renderer.setRenderTarget(rt)

  //

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.minDistance = 2
  controls.maxDistance = 5

  //

  // window.addEventListener('resize', onWindowResize)
  renderer.domElement.addEventListener('click', clickMe)
}

// const onWindowResize = () => {
//   camera.aspect = width / height
//   camera.updateProjectionMatrix()

//   renderer.setSize(width, height)
// }

const clickMe = () => {
  console.log('clicked')
  // const target = new THREE.WebGLRenderTarget(256, 256)
  // 1. Set the renderer to the render target

  // bgRenderer.render(target, camera)

  // 2. Render your scene (and potentially a different camera/scene setup)
  // renderer.render(scene, camera)

  // 3. Reset the renderer to the default framebuffer (the screen)
  // renderer.setRenderTarget(null)

  const pixels = new Uint8Array(256 * 256)

  // renderer.readRenderTargetPixels(rt, 100, 100, 256, 256, pixels)

  console.log(pixels)

  console.log(pixels.filter(v => v !== 0).length)


// 4. Optionally, render the main scene
  // renderer.copyFramebufferToTexture(texture, new THREE.Vector2(100, 100),)
}

let scale = 1

const animate = () => {
  controls.update()
  // scale *= 1.001
  // console.log(scale)
  object.scale.set(scale, scale, scale)

  // const target = new THREE.WebGLRenderTarget(256, 256)
  // renderer.setRenderTarget(rt)
  // renderer.render(scene, camera)

  // if (Math.random() < 0.01) {
  //   var gl = renderer.getContext()
  //   const pixels = new Uint8Array(256 * 256 * 4);
  //   gl.readPixels(100, 100, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    
  //   // const pixels = new Uint8Array(256 * 256)
    
  //     // const pixels = new Uint8Array(width * height * 4);
  //     // renderer.readRenderTargetPixels(rt, 0, 0, width, height, pixels)

  //     console.log(pixels)

  //     console.log(pixels.filter(v => v !== 0 && v !== 255).length)

  //   const canvas:HTMLCanvasElement = document.querySelector('#twod')!
  //   const context = canvas.getContext('2d')!
  //   const imageData = context.createImageData(256, 256)
  //   imageData.data.set(pixels)
  //   context.putImageData(imageData, 0, 0)
  // }

  // renderer.setRenderTarget(null)

  renderer.render(scene, camera)

    if (Math.random() < 0.01) {
      
      // const pixels = new Uint8Array(64 * 64 * 4)
      
      // const pixels = new Uint8Array(64 * 64 * 4)
      // renderer.readRenderTargetPixels(rt, 0, 0, 64, 64, pixels)
      
      var gl = renderer.getContext()
      const pixels = new Uint8Array(64 * 64 * 4);
      gl.readPixels(300, 300, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      console.log(pixels)
      
      console.log(pixels.filter(v => v !== 0 && v !== 255).length)
      
    const canvas:HTMLCanvasElement = document.querySelector('#twod')!
    const context = canvas.getContext('2d')!
    const imageData = context.createImageData(64, 64)
    imageData.data.set(pixels)
    context.putImageData(imageData, 0, 0)
  }
}

go()
