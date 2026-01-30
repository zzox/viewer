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


// let texture:THREE.FramebufferTexture,
//   cameraOrtho:THREE.OrthographicCamera,
//   sceneOrtho:THREE.Scene,
//   sprite:THREE.Sprite

const width = 640
const height = 640

// const textureSize = 512

// const vector = new THREE.Vector2()

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

  // cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
  // cameraOrtho.position.z = 10;

  // scene

  scene = new THREE.Scene()
  // sceneOrtho = new THREE.Scene();

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

  renderer = new THREE.WebGLRenderer({ /* preserveDrawingBuffer: true, */ /* antialias: false */ })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  renderer.setAnimationLoop(animate)
  const container = document.querySelector('#container')
  container!.prepend(renderer.domElement)


  // texture = new THREE.FramebufferTexture( textureSize, textureSize );

  //

  // const spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
  // sprite = new THREE.Sprite( spriteMaterial );
  // sprite.scale.set( textureSize, textureSize, 1 );
  // sceneOrtho.add( sprite );
  // const halfWidth = width / 2;
  // const halfHeight = height / 2;

  // const halfImageWidth = textureSize / 2;
  // const halfImageHeight = textureSize / 2;

  // sprite.position.set(-halfWidth + halfImageWidth, halfHeight - halfImageHeight, 1 );

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

  // renderer.clear()
  renderer.render(scene, camera)

    // calculate start position for copying data

    // const dpr = 1

    // vector.x = ( window.innerWidth * dpr / 2 ) - ( textureSize / 2 );
    // vector.y = ( window.innerHeight * dpr / 2 ) - ( textureSize / 2 );

    // renderer.copyFramebufferToTexture( texture, vector );

    // renderer.clearDepth();
    // renderer.render( sceneOrtho, cameraOrtho );

  if (Math.random() < 0.01) {
    // const pixels = new Uint8Array(64 * 64 * 4)

    // const pixels = new Uint8Array(64 * 64 * 4)
    // renderer.readRenderTargetPixels(rt, 0, 0, 64, 64, pixels)
    console.time('asdf')
    const canvas:HTMLCanvasElement = document.querySelector('#twod')!
    const twoDcontext = canvas.getContext('2d')!
    // const imageData = twoDcontext.createImageData(64, 64)
    const gl = renderer.getContext()

    for (let i = 0; i < 4; i++) {
      // const pixels = new Uint8Array(64 * 64 * 4);
      // gl.readPixels(640 - 32, 640 - 32, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      // console.log(pixels)

      // console.log(pixels.filter(v => v !== 0 && v !== 255).length)

      renderer.render(scene, camera)

      // imageData.data.set(pixels)
      twoDcontext.drawImage(gl.canvas, 640 - 32, 640 - 32, 64, 64, i * 64, 0, 64, 64)
      object.rotateY(Math.PI / 2)
    }
    console.timeEnd('asdf')
  }
}

go()
