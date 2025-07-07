import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import starsTexture from './images/stars.jpg';
import sunTexture from './images/sun.jpg';
import mercuryTexture from './images/mercury.jpg';
import venusTexture from './images/venus.jpg';
import earthTexture from './images/earth.jpg';
import marsTexture from './images/mars.jpg';
import jupiterTexture from './images/jupiter.jpg';
import saturnTexture from './images/saturn.jpg';
import uranusTexture from './images/uranus.jpg';
import neptuneTexture from './images/neptune.jpg';
import plutoTexture from './images/pluto.jpg';


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 1, 2000 );
const orbit = new OrbitControls( camera, renderer.domElement );
camera.position.z = 100;
scene.add(camera);

const textureLoader = new THREE.TextureLoader();

const starsGeo = new THREE.SphereGeometry( 1000, 64, 64 ); 
const starsMat = new THREE.MeshBasicMaterial( { 
    map : textureLoader.load(starsTexture),
    side: THREE.DoubleSide
}); 
const stars = new THREE.Mesh( starsGeo, starsMat );
scene.add(stars);


const sunGeo = new THREE.SphereGeometry( 10 ,64,64); 
const sunMat = new THREE.MeshBasicMaterial( { 
    map : textureLoader.load(sunTexture)
}); 
const sun = new THREE.Mesh( sunGeo, sunMat );
scene.add(sun);


function createPlanet(size,texture,positionX,hasRing = false,ringInnerRadius=0,ringOuterRadius=0,ringTexture=null){
    const planetGeo = new THREE.SphereGeometry(size,32,32);
    const planetMat = new THREE.MeshBasicMaterial({map:textureLoader.load(texture)});
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.position.x = positionX;

    const planetObj = new THREE.Object3D();
    planetObj.add(planet);
    scene.add(planetObj);

    if(hasRing){
        const ringGeo = new THREE.RingGeometry( ringInnerRadius, ringOuterRadius, 32 );
        const ringMat = new THREE.MeshBasicMaterial({map:textureLoader.load(ringTexture),side: THREE.DoubleSide});
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.x = positionX;
        planetObj.add(ring);

    }
    return [planet,planetObj];
}

const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.background = 'rgba(0,0,0,0.7)';
tooltip.style.color = 'white';
tooltip.style.padding = '6px 10px';
tooltip.style.borderRadius = '5px';
tooltip.style.pointerEvents = 'none';
tooltip.style.fontSize = '13px';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);


const planetsData = [
    { name: 'Mercury', size: 3.2, texture: mercuryTexture, positionX: 28, hasRing: false },
    { name: 'Venus', size: 5.8, texture: venusTexture, positionX: 44, hasRing: false },
    { name: 'Earth', size: 6, texture: earthTexture, positionX: 62, hasRing: false },
    { name: 'Mars', size: 4, texture: marsTexture, positionX: 78, hasRing: false },
    { name: 'Jupiter', size: 12, texture: jupiterTexture, positionX: 100, hasRing: false },
    { name: 'Saturn', size: 10, texture: saturnTexture, positionX: 138, hasRing: true, ringInnerRadius: 13, ringOuterRadius: 20, ringTexture: saturnTexture },
    { name: 'Uranus', size: 7, texture: uranusTexture, positionX: 176, hasRing: true, ringInnerRadius: 10, ringOuterRadius: 12, ringTexture: uranusTexture },
    { name: 'Neptune', size: 7, texture: neptuneTexture, positionX: 200, hasRing: false },
    { name: 'Pluto', size: 2.8, texture: plutoTexture, positionX: 216, hasRing: false } 
];
    
const planetSelfRotation = [0.004, 0.002, 0.02, 0.018, 0.04, 0.038, 0.03, 0.032, 0.008];
const planetAroundSunRotation = [0.04, 0.015, 0.01, 0.008, 0.002, 0.0009, 0.0004, 0.0001, 0.00007];

const planets = [];
const planetsObj = [];

planetsData.forEach((data,index)=>{
    const [planet,planetObj] = createPlanet(data.size,data.texture,data.positionX,data.hasRing,data.ringInnerRadius,data.ringOuterRadius,data.ringTexture);
    planets.push(planet);
    planetsObj.push(planetObj);
});

// Add visible orbit rings
planetsData.forEach((data) => {
    const orbitRadius = data.positionX;
    const orbitGeo = new THREE.RingGeometry(orbitRadius - 0.05, orbitRadius + 0.05, 128);
    const orbitMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
    orbitRing.rotation.x = Math.PI / 2;
    scene.add(orbitRing);
});

function animate(){
    sun.rotation.y += 0.01;
    planets.forEach((planet,index)=>{planet.rotateY(planetSelfRotation[index])});
    planetsObj.forEach((planetObj,index)=>{planetObj.rotateY(planetAroundSunRotation[index])});
    orbit.update();
    stars.position.copy(camera.position);
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);
window.addEventListener('resize',function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});

export {
  renderer,
  scene,
  camera,
  orbit,
  sun,
  planets,
  planetsObj,
  planetsData,
  planetAroundSunRotation
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);
    
    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        const index = planets.indexOf(intersected);
        const data = planetsData[index];
        tooltip.innerHTML = `
            <strong>${data.name}</strong><br>
            Size: ${data.size}<br>
            Distance: ${data.positionX} units
        `;
        tooltip.style.left = event.clientX + 10 + 'px';
        tooltip.style.top = event.clientY + 10 + 'px';
        tooltip.style.display = 'block';
    } else {
        tooltip.style.display = 'none';
    }
});
