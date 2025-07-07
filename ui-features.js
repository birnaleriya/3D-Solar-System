import * as THREE from 'three';
import {
  renderer,
  scene,
  camera,
  orbit,
  sun,
  planets,
  planetsObj,
  planetsData,
  planetAroundSunRotation
} from './main.js';


// Clone the rotation array so we can modify live speed:
const originalSpeeds = [...planetAroundSunRotation];
let currentSpeeds = [...planetAroundSunRotation];
let isPaused = false;
let isDarkMode = false;

// ---- 1. Speed Control UI
const speedControlsDiv = document.getElementById('speedControls');
planetsData.forEach((planet, i) => {
  const container = document.createElement('div');
  container.innerHTML = `
    <label>${planet.name}</label>
    <input type="range" min="0" max="0.1" step="0.001" value="${currentSpeeds[i]}" data-index="${i}">
    <span id="val-${i}">${currentSpeeds[i]}</span>
  `;
  speedControlsDiv.appendChild(container);
});

speedControlsDiv.querySelectorAll('input[type="range"]').forEach(slider => {
  slider.addEventListener('input', (e) => {
    const index = parseInt(e.target.dataset.index);
    const val = parseFloat(e.target.value);
    currentSpeeds[index] = val;
    document.getElementById(`val-${index}`).innerText = val.toFixed(3);
  });
});

// ---- 2. Pause/Resume Button
document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').innerText = isPaused ? 'Resume' : 'Pause';
});

// ---- 3. Dark/Light Mode Toggle
document.getElementById('themeToggleBtn').addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.style.backgroundColor = isDarkMode ? '#000' : '#fff';
  document.body.style.color = isDarkMode ? '#fff' : '#000';
  document.getElementById('controls').style.background = isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
});

// ---- 4. Tooltips/Labels
planets.forEach((planet, i) => {
  const sprite = makeTextSprite(planetsData[i].name);
  sprite.position.set(0, planetsData[i].size + 2, 0);
  planet.add(sprite);
});

function makeTextSprite(message) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = 'Bold 24px Arial';
  context.fillStyle = 'white';
  context.fillText(message, 0, 24);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  return new THREE.Sprite(material);
}

// ---- 5. Camera Zoom on Planet Click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets);
  if (intersects.length > 0) {
    const planet = intersects[0].object;
    camera.position.set(planet.position.x + 20, planet.position.y + 10, planet.position.z + 20);
    orbit.target.copy(planet.position);
  }
});

// ---- 6. Hook into existing animate loop
function animateFeatures() {
  if (!isPaused) {
    sun.rotation.y += 0.01;
    planets.forEach((planet, i) => planet.rotateY(0.02));
    planetsObj.forEach((obj, i) => obj.rotateY(currentSpeeds[i]));
  }
  orbit.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animateFeatures);
}

animateFeatures();

