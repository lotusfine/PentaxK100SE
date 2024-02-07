import './style.css'
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
gsap.registerPlugin(ScrollTrigger);




// Cargar el mapa HDR
const rgbeLoader = new RGBELoader();
rgbeLoader.load('hdr/fondo.hdr', function (texture) {
 texture.mapping = THREE.EquirectangularReflectionMapping;
 renderer.shadowMap.enabled = true
 renderer.shadowMap.type = THREE.PCFSoftShadowMap;




 renderer.toneMapping = THREE.AgXToneMapping;
 renderer.toneMappingExposure = 10;
}); 






const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
canvas: document.querySelector('#bg'),
antialias: true,




});




renderer.setSize(window.innerWidth, window.innerHeight);




const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);




//renderer.setClearColor(0x402a08);




camera.position.set(0, 2, 15);
camera.lookAt(0, 0, 0);






// Configuración de la luz
const light = new THREE.SpotLight(0xc9bba5, 40, 70);
light.position.set(-4, 4, 6);




light.castShadow = true;




light.shadow.mapSize.width =  8192; // O valores mayores
light.shadow.mapSize.height =  8192; // O valores mayores
light.shadow.bias = -0.00007; // Ajusta este valor con cuidado
light.shadow.normalBias = 0.0007; // Ajusta este valor con cuidado




scene.add(light); 








// Crear un objeto ficticio para la animación de lookAt
const lookAtTarget = new THREE.Object3D();
scene.add(lookAtTarget);








// Cargando el modelo
const loader = new GLTFLoader();






let pentaxModel;
loader.load('pentax/scene.gltf', function (gltf) {
 pentaxModel = gltf.scene;


// Actualizar materiales y configuraciones de sombras
updateMaterials(pentaxModel);


 scene.add(pentaxModel);
}, undefined, function (error) {
 console.error('Error al cargar el modelo:', error);




});




function updateMaterials(pentaxModel) {
 pentaxModel.traverse((object) => {
     if (object.isMesh && object.material) {
         // Configurar metalness, roughness, etc.
         object.material.metalness = 1; // Ajusta según tus necesidades
         object.material.roughness = 10; // Ajusta según tus necesidades




         // Configurar sombras
         object.castShadow = true; // El objeto proyectará sombras
         object.receiveShadow = true; // El objeto recibirá sombras
       }
     });
 }








//posicion de la camara en las distintas paginas
const pagesConfig = [
{id:"page0", cameraPosition: { x: -0.1, y: 1, z: 10 }, cameraLookAt: { x: -3, y: 0, z: 1 }, lightPosition: { x: 4, y: 4, z: 6 }},
{id:"page1", cameraPosition: { x: 6, y: 4, z: 3 }, cameraLookAt: { x: -3.5, y: -1.5, z: 2 }, lightPosition: { x: -6, y: 5, z: 3 }},
{id:"page2", cameraPosition: { x: 2, y: 3, z: 2.4 }, cameraLookAt: { x: -2, y: -0.5, z: 0 }, lightPosition: { x: -5, y: 4, z: 5 }},
{id:"page3", cameraPosition: { x: -6.7, y: 2, z: 4.6 }, cameraLookAt: { x: 4, y: 0, z: 1.7 }, lightPosition: { x: 4.3, y: 5, z: 6 }},
{id:"page4", cameraPosition: { x: -3, y: 5.3, z: -2 }, cameraLookAt: { x: 0, y: -6.3, z: 6 }, lightPosition: { x: -4, y: 3, z: 4 }},
];








// Crear una línea de tiempo de GSAP con ScrollTrigger
const timeline = gsap.timeline({
 scrollTrigger: {
   trigger: '#scroll-container',
   start: 'top top',
   end: 'bottom bottom',
   scrub: true,
   markers: true
 }
});




const pauseDuration = 0.2; // Duración de la "pausa" en segundos




// Añadir animaciones a la línea de tiempo
pagesConfig.forEach((page, i) => {
 // Animar la posición de la cámara
 timeline.to(camera.position, {
   x: page.cameraPosition.x,
   y: page.cameraPosition.y,
   z: page.cameraPosition.z,
   duration: 1, // Duración de la transición
   ease: 'power1.inOut'
 }, i * (1 + pauseDuration)); // Añadir pausa entre transiciones




 // Animar el objetivo de lookAt
 timeline.to(lookAtTarget.position, {
   x: page.cameraLookAt.x,
   y: page.cameraLookAt.y,
   z: page.cameraLookAt.z,
   duration: 1,
   ease: 'power1.inOut',
   onUpdate: () => {
     camera.lookAt(lookAtTarget.position);
   }
 }, i * (1 + pauseDuration));


 // Animar la posición de la luz
 timeline.to(light.position, {
   x: page.lightPosition.x,
   y: page.lightPosition.y,
   z: page.lightPosition.z,
   duration: 1,
   ease: 'power1.inOut'
 }, i * (1 + pauseDuration));


 
// Animar la visibilidad de la página
timeline.fromTo(`#${page.id}`,
{ autoAlpha: 0 },
{ autoAlpha: 1, duration: 1, ease: 'power1.inOut' },
i * (1 + pauseDuration)
);

// Añadir un período de "pausa" donde la página actual se mantiene visible
timeline.to(`#${page.id}`,
{ autoAlpha: 1, duration: pauseDuration, ease: 'power1.inOut' },
i * (1 + pauseDuration) + 1
);

// Añadir un ScrollTrigger para cada página
ScrollTrigger.create({
trigger: `#${page.id}`,
start: `${(i * 100)}vh center`,
end: `${((i + 1) * 100)}vh center`,
onEnter: () => resaltarTexto(`#${page.id}`),
onLeaveBack: () => resetearTexto(`#${page.id}`),
markers: true // Para depuración
});
});

function resaltarTexto(selector) {
// Añadir animación de resalte
gsap.to(selector, { scale: 1.1, duration: 0.5, ease: "power1.inOut" });
}

function resetearTexto(selector) {
// Resetear animación de texto
gsap.to(selector, { scale: 1, duration: 0.5 });
}


function animate() {
renderer.setAnimationLoop(animate);
renderer.render(scene, camera);
}




window.addEventListener('resize', function() {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});








animate();
