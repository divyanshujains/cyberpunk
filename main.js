import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';

// Create a scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7;

var model;
// Create a renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0015;
composer.addPass(rgbShiftPass);

const premGenertor = new THREE.PMREMGenerator(renderer);
premGenertor.compileEquirectangularShader();


new RGBELoader().load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = premGenertor.fromEquirectangular(texture).texture;
    scene.environment = envMap;
   
    
    texture.dispose();
    premGenertor.dispose(); 
    
    const loader = new GLTFLoader();
    loader.load('/DamagedHelmet (1).gltf', function(gltf) {
        scene.add(gltf.scene);
        model = gltf.scene;
        scene.add(model);
        gltf.scene.scale.set(2, 2, 2);
        gltf.scene.position.set(0, 0, 0);
    });
});

window.addEventListener('mousemove', (e) => {
if(model){
  gsap.to(model.rotation, {
    y: (e.clientX / window.innerWidth - 0.5) * Math.PI * 0.3,
    x: (e.clientY / window.innerHeight - 0.5) * Math.PI * 0.3,
    duration: 0.8,
    ease: "power2.out"
  });
    }

    
});
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

//Animation loop
function animate() {
    requestAnimationFrame(animate);
    composer.render(); // Use composer instead of renderer
}
animate();
