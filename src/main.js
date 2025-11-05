import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';








const canvas = document.querySelector('#canvas');
if (!canvas) console.error('Add <canvas id="canvas"></canvas> to index.html');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.45, 3.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x000000);


const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();




// const particleCount = 1000;
// const particles = new THREE.BufferGeometry();
// const positions = new Float32Array(particleCount * 3);
// for (let i = 0; i < particleCount * 3; i++) {
//   positions[i] = (Math.random() - 0.5) * 20;
// }
// particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// const material = new THREE.PointsMaterial({
//   color: 'white',
//   size: 0.05,
//   transparent:true,
//   opacity: 1,
// });
// const particleSystem = new THREE.Points(particles, material);
// scene.add(particleSystem);

// function updateParticles() {
//   particleSystem.rotation.y += 0.001;
// }

const gridHelper = new THREE.GridHelper(30, 300, 'grey', 'grey');
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
scene.add(gridHelper);

scene.fog = new THREE.Fog('black', 1, 15);



let model;


new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/christmas_photo_studio_04_1k.hdr', (texture) => {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    // scene.background = envMap;
    texture.dispose();
    pmremGenerator.dispose();

    const gltfUrl1 = new URL('./assets/pagani1.glb', import.meta.url).href;
    // const gltfUrl2 = new URL('./assets/car_studio.glb', import.meta.url).href;
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');  // CDN for decoder
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      gltfUrl1,
      (gltf) => {
        model = gltf.scene;
        scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.position.y = 0.01;

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        model.scale.multiplyScalar(2.5 / maxDim);

        console.log('Pagani model loaded');
      },
      (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
      (err) => console.error('GLTF load error:', err)
    );



  });




// const gltfUrl1 = new URL('./assets/studio.glb', import.meta.url).href;
// // const gltfUrl2 = new URL('./assets/car_studio.glb', import.meta.url).href;
// const loader = new GLTFLoader();

// loader.load(
//   gltfUrl1,
//   (gltf) => {
//     model = gltf.scene;
//     scene.add(model);

//     const box = new THREE.Box3().setFromObject(model);
//     const center = box.getCenter(new THREE.Vector3());
//     model.position.sub(center);
//     model.position.y = 0.01;

//     const size = box.getSize(new THREE.Vector3());
//     const maxDim = Math.max(size.x, size.y, size.z);
//     model.scale.multiplyScalar(2.5 / maxDim);

//     console.log('Pagani model loaded');
//   },
//   (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
//   (err) => console.error('GLTF load error:', err)
// );

// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// rimLight.castShadow = true;
// model.traverse(obj => {
// if (obj.isMesh) obj.castShadow = true;
// });



const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
rimLight.position.set(0, 2.5, -2);
scene.add(rimLight);






// new RGBELoader()
//   .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_moonrise_puresky_1k.hdr', (texture) => {
//     const envMap = pmremGenerator.fromEquirectangular(texture).texture;
//     scene.environment = envMap;
//     // scene.background = envMap;
//     texture.dispose();
//     pmremGenerator.dispose();

//     const gltfUrl2 = new URL('./assets/', import.meta.url).href;
//     const loader = new GLTFLoader();


//     // ...
//     loader.load(
//       gltfUrl2,
//       (gltf) => {
//         const studio = gltf.scene;
//         scene.add(studio);
//         console.log('STUDIO LOADED');
//       },
//       (xhr) => console.log('Studio: ' + (xhr.loaded / xhr.total * 100) + '% loaded'),
//       (err) => console.error('Studio load error:', err)
//     );

//   });




window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
let mouseX = 0, mouseY = 0;
let animationProgress = 0;
let carArrived = false;

window.addEventListener('mousemove', (e) => {

  if (!carArrived) return;
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  // camera.position.x += (x - camera.position.x) * 0.05;
  // camera.position.y += (y - camera.position.y) * 0.05;
});


function animate() {
  requestAnimationFrame(animate);
  // updateParticles();

  if (model) {

    if (!carArrived) {

      animationProgress += 0.010;
      const t = Math.min(animationProgress, 1);
      const ease = t * t * (3 - 2 * t);
      model.position.z = THREE.MathUtils.lerp(-10, 0, ease);




      if (t >= 1) {
        carArrived = true;
        model.position.z = 0;
        console.log('Car arrived in scene 🚘');

      }
    }


    if (carArrived) {
      const targetX = mouseX * Math.PI * 0.1;
      const targetY = mouseY * Math.PI * 0.1;
      model.rotation.y += (targetX - model.rotation.y) * 0.1;
      model.rotation.x = THREE.MathUtils.clamp(model.rotation.x, -0.2, 0.2);
      model.rotation.y = THREE.MathUtils.clamp(model.rotation.y, -0.3, 0.3);

    }


  }

  composer.render();
}
animate();

