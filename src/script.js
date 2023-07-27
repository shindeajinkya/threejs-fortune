import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import * as dat from "lil-gui";
// importing font
// import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json';

THREE.ColorManagement.enabled = false;

let textToDisplayWithLineBreaks;
const isTesting = false;

/**
 * Base
 */
// Debug
// const gui = new dat.GUI();
let userName;
if (!isTesting) {
  userName = prompt("Enter your name: ");
  fetchFortune();
}

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const matcap3Texture = textureLoader.load("/textures/matcaps/4.png");
const matcap8Texture = textureLoader.load("/textures/matcaps/8.png");

/**
 * Fonts
 */

const fontLoader = new FontLoader();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 10;
camera.position.y = 10;
camera.position.z = 30;
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;

scene.add(pointLight);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
if (window.innerWidth < 720) {
  controls.enabled = false;
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls

  if (window.innerWidth > 720) {
    controls.update();
    camera.position.x = Math.sin(elapsedTime) * Math.PI;
    camera.position.y = Math.cos(elapsedTime) * Math.PI;
  }
  //   camera.position.z = Math.sin(elapsedTime);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

if (isTesting) {
  fetchFortune();
}

if ("ondeviceorientation" in window) {
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    // Handle iOS 13+ devices.
    DeviceMotionEvent.requestPermission()
      .then((state) => {
        if (state === "granted") {
          window.addEventListener("devicemotion", handleOrientation);
        } else {
          console.error("Request to access the orientation was rejected");
        }
      })
      .catch(console.error);
  } else {
    // Handle regular non iOS 13+ devices.
    window.addEventListener("devicemotion", handleOrientation);
  }
}

function handleOrientation(event) {
  const { alpha, beta, gamma } = event;
  // camera.position.x += gamma / 100 - camera.position.x * 0.5;
  // camera.position.y += (-beta / 100 - camera.position.y) * 0.5;
  camera.position.x = (gamma / 100) * 8;
  camera.position.y = (-beta / 100) * 5;
  camera.position.z = (alpha / 100) * 16;
  camera.lookAt(new THREE.Vector3());
}

async function fetchFortune() {
  try {
    if (!isTesting) {
      const response = await fetch(
        "https://fortune-cookie2.p.rapidapi.com/fortune",
        {
          method: "GET",
          headers: {
            "x-rapidapi-key":
              "c63b96f006msh5e9e6857f4a0adfp1c62b8jsne56fdfff4953",
            "x-rapidapi-host": "fortune-cookie2.p.rapidapi.com",
          },
        }
      );
      const data = await response.json();
      textToDisplayWithLineBreaks = data.answer
        .split(" ")
        .reduce((acc, word, index) => {
          if (index % 6 === 0) {
            return `${acc} \n ${word}`;
          }
          return `${acc} ${word}`;
        }, `${userName},`);
    } else {
      textToDisplayWithLineBreaks = "Testing";
    }

    fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
      const textGeometry = new TextGeometry(textToDisplayWithLineBreaks, {
        font,
        size: 1,
        height: 0.2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4,
      });

      //   textGeometry.computeBoundingBox();
      //   textGeometry.translate(
      //     -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
      //     -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
      //     -(textGeometry.boundingBox.max.z - 0.03) * 0.5
      //   );
      textGeometry.center();

      const textMaterial = new THREE.MeshMatcapMaterial({
        matcap: matcap3Texture,
      });

      //   textMaterial.wireframe = true;

      const text = new THREE.Mesh(textGeometry, textMaterial);

      scene.add(text);

      camera.lookAt(text.position);

      const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
      const donutMaterial = new THREE.MeshMatcapMaterial({
        matcap: matcap8Texture,
      });
      for (let i = 0; i < 500; i++) {
        const donut = new THREE.Mesh(donutGeometry, donutMaterial);

        // donut.position.x = (Math.random() - 0.5) * 10;
        // donut.position.y = (Math.random() - 0.5) * 10;
        // donut.position.z = (Math.random() - 0.5) * 10;

        // it should not override the text modify above values
        donut.position.x = (Math.random() - 0.5) * 40;
        donut.position.y = (Math.random() - 0.5) * 40;
        donut.position.z = (Math.random() - 0.5) * 40;

        donut.rotation.x = Math.random() * Math.PI;
        donut.rotation.y = Math.random() * Math.PI;

        const scale = Math.random();
        donut.scale.set(scale, scale, scale);

        scene.add(donut);
      }
    });
  } catch (error) {
    console.log(error);
  }
}
