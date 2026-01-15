import * as THREE from 'three';
import {OrbitControls} from "three/addons";
import {mythData} from "./dummyData";

const canvas = document.getElementById("scene")
const info = document.getElementById("info")

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(0, 0, 15)

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

// Color mapping by mythology
const mythologyColors = {
    Greek: 0x00ffff,
    Norse: 0xcccccc,
    Egyptian: 0xffd700,
    Japanese: 0xff3333
}

// Create star sprite texture
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const centerX = 32;
    const centerY = 32;

    // Draw star shape
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * 28;
        const y = centerY + Math.sin(angle) * 28;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Add glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

const starTexture = createStarTexture();
const stars = [];
const starMap = new Map()

mythData.forEach(data => {
    const material = new THREE.SpriteMaterial({
        map: starTexture,
        color: mythologyColors[data.mythology] || 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    const star = new THREE.Sprite(material);
    star.scale.set(0.5, 0.5, 1);
    star.position.set(data.position.x, data.position.y, data.position.z);
    star.userData = data;
    stars.push(star);
    starMap.set(data.id, star);
    scene.add(star);
});


mythData.forEach(data => {
    data.relations.forEach(targetId => {
        const start = starMap.get(data.id).position
        const end = starMap.get(targetId).position

        const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
        const material = new THREE.LineBasicMaterial({ color: 0xffffff })

        const line = new THREE.Line(geometry, material)
        scene.add(line)
    })
})

const labels = []

mythData.forEach(data => {
    const div = document.createElement("div")
    div.className = "label"
    div.textContent = data.name
    document.body.appendChild(div)

    labels.push({
        element: div,
        object: starMap.get(data.id)
    })
})

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    // Create 1000 small background stars
    for (let i = 0; i < 1000; i++) {
        const x = THREE.MathUtils.randFloatSpread(100);
        const y = THREE.MathUtils.randFloatSpread(100);
        const z = THREE.MathUtils.randFloatSpread(100);
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });

    return new THREE.Points(geometry, material);
}


scene.background = new THREE.Color(0x000510)
scene.add(createStarfield())


const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener("click", event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(stars)

    if (intersects.length > 0) {
        const data = intersects[0].object.userData
        info.innerHTML = `
      <strong>${data.name}</strong><br>
      Mythology: ${data.mythology}
    `
    }
})

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
    labels.forEach(({ element, object }) => {
        const pos = object.position.clone();
        pos.y += 0.3;
        pos.project(camera);
        const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;
        const isVisible = pos.z < 1;
        element.style.display = isVisible ? "block" : "none";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    });

    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}



animate()
