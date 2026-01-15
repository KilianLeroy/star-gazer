import * as THREE from 'three'

/**
 * Create a basic orbit camera that follows mouse movement
 */
export function createOrbitControls(
  camera: THREE.PerspectiveCamera,
  element: HTMLElement
) {
  let mouseX = 0
  let mouseY = 0

  const onMouseMove = (event: MouseEvent) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1
  }

  element.addEventListener('mousemove', onMouseMove)

  return {
    update: () => {
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)
    },
    dispose: () => {
      element.removeEventListener('mousemove', onMouseMove)
    },
  }
}

/**
 * Create a grid helper for visual reference
 */
export function createGridHelper(size = 10, divisions = 10, color = 0x444444) {
  return new THREE.GridHelper(size, divisions, color, color)
}

/**
 * Create an axes helper for orientation
 */
export function createAxesHelper(size = 5) {
  return new THREE.AxesHelper(size)
}

/**
 * Dispose of a Three.js object and its children recursively
 */
export function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if ('geometry' in child && 'material' in child) {
      const mesh = child as THREE.Mesh
      mesh.geometry?.dispose()

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose())
      } else {
        mesh.material?.dispose()
      }
    }
  })
}

/**
 * Load a texture with error handling
 */
export async function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      url,
      (texture) => resolve(texture),
      undefined,
      (error) => reject(error)
    )
  })
}

/**
 * Create a basic material with common settings
 */
export function createStandardMaterial(
  color: number,
  options: Partial<THREE.MeshStandardMaterialParameters> = {}
) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.4,
    ...options,
  })
}

