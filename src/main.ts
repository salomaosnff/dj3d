import "./style.css";
import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

enum Keys {
  FORWARD = "w",
  BACKWARD = "s",
  LEFT = "a",
  RIGHT = "d",
}

class GameInput {
  keys = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => this.keys.add(e.key));
    window.addEventListener("keyup", (e) => this.keys.delete(e.key));
  }

  public isKeyDown(key: string): boolean {
    return this.keys.has(key);
  }
}

const input = new GameInput();

const gltLoader = new GLTFLoader();

const { innerWidth: WIDTH, innerHeight: HEIGHT } = window;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setClearColor(0xffffff, 0);

const renderer2 = new CSS3DRenderer();
const controls = new OrbitControls(camera, document.body);
const gridHelper = new THREE.GridHelper(100, 100);

renderer.setSize(WIDTH, HEIGHT);
renderer2.setSize(WIDTH, HEIGHT);

function YoutubeElement(id: string, width = 800, height = 450) {
  const obj = new THREE.Object3D();
  const iframe = document.createElement("iframe");

  iframe.style.width = width + "px";
  iframe.style.height = height + "px";
  iframe.style.border = "0";
  iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;

  const css3dObj = new CSS3DObject(iframe);

  obj.add(css3dObj);

  const material = new THREE.MeshBasicMaterial({
    opacity: 0,
    color: 0x000000,
    blending: THREE.NoBlending,
    transparent: true,
  });

  const geometry = new THREE.BoxGeometry(width, height, 0.001);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  obj.add(mesh);

  css3dObj.position.set(0, height / 2, 0);

  mesh.position.copy(css3dObj.position);

  return obj;
}


function Player(): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    gltLoader.load('/gl/char/SimplePeople2_Barista.glb', (res: any) => {
      console.log(res);
      
      res.scene.position.set(0, 0, 10);
      resolve(res.scene)
    })
  })
}

document.body.appendChild(renderer.domElement);
document.body.appendChild(renderer2.domElement.children[0]);

renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.pointerEvents = "none";
renderer.domElement.style.zIndex = "1";

renderer2.domElement.style.position = "absolute";
renderer2.domElement.style.top = "0";
renderer2.domElement.style.zIndex = "-1";

const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
const pointLight = new THREE.PointLight(0xffffff, 1);

const video = YoutubeElement("dQw4w9WgXcQ");

video.scale.set(0.05, 0.05, 1);

const player = await Player();
scene.add(gridHelper, ambientLight, pointLight, player, video);

pointLight.position.set(0, 50, 100);
camera.position.z = 50;
camera.position.y = 50;

const speed = 0.2;

const animate = () => {
  requestAnimationFrame(animate);

  controls.update();


  if (input.isKeyDown(Keys.FORWARD)) {
    player.position.z -= speed;
  } else if (input.isKeyDown(Keys.BACKWARD)) {
    player.position.z += speed;
  }

  if (input.isKeyDown(Keys.LEFT)) {
    player.position.x -= speed;
  } else if (input.isKeyDown(Keys.RIGHT)) {
    player.position.x += speed;
  }

  pointLight.lookAt(player.position);



  // 3th person camera

  // camera.position.x = player.position.x;
  // camera.position.z = player.position.z + 20;
  // camera.position.y = player.position.y + 20;

  // camera.lookAt(player.position);

  renderer.render(scene, camera);
  renderer2.render(scene, camera);
};

animate();
