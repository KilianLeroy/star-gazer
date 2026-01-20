import * as THREE from 'three'
import type { StarData } from '~/data/mythologyData'
import { getDomainColor } from '~/utils/sparqlDataConverter'

export function useMythologyVisualization(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  canvasContainer?: HTMLElement
) {
  const stars: THREE.Sprite[] = []
  const starMap = new Map<number, THREE.Sprite>()
  const labels: Array<{ element: HTMLElement; object: THREE.Sprite }> = []
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  const container = canvasContainer || document.body
  const sceneObjects: THREE.Object3D[] = [] // Track objects added to scene for cleanup
  let starfieldPoints: THREE.Points | null = null
  let starfieldOpacities: Float32Array | null = null
  let starfieldTwinkleSpeeds: Float32Array | null = null
  let starfieldPhases: Float32Array | null = null
  const mythologyStarData = new Map<THREE.Sprite, { baseScale: number; pulseSpeed: number; pulsePhase: number }>()

  // ...existing code...

  /**
   * Create a star sprite texture with enhanced glow and multi-layered effect
   */
  function createStarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!

    const centerX = 64
    const centerY = 64

    // Draw outer glow (largest)
    const outerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 64)
    outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    outerGlow.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)')
    outerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
    outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = outerGlow
    ctx.fillRect(0, 0, 128, 128)

    // Draw bright center with cross flare
    ctx.save()
    ctx.translate(centerX, centerY)

    // Horizontal flare
    const hFlare = ctx.createLinearGradient(-60, 0, 60, 0)
    hFlare.addColorStop(0, 'rgba(255, 255, 255, 0)')
    hFlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)')
    hFlare.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = hFlare
    ctx.fillRect(-60, -2, 120, 4)

    // Vertical flare
    const vFlare = ctx.createLinearGradient(0, -60, 0, 60)
    vFlare.addColorStop(0, 'rgba(255, 255, 255, 0)')
    vFlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)')
    vFlare.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = vFlare
    ctx.fillRect(-2, -60, 4, 120)

    // Diagonal flares (softer)
    ctx.rotate(Math.PI / 4)
    const d1Flare = ctx.createLinearGradient(-50, 0, 50, 0)
    d1Flare.addColorStop(0, 'rgba(255, 255, 255, 0)')
    d1Flare.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)')
    d1Flare.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = d1Flare
    ctx.fillRect(-50, -1, 100, 2)

    const d2Flare = ctx.createLinearGradient(0, -50, 0, 50)
    d2Flare.addColorStop(0, 'rgba(255, 255, 255, 0)')
    d2Flare.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)')
    d2Flare.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = d2Flare
    ctx.fillRect(-1, -50, 2, 100)

    ctx.restore()

    // Draw bright core
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20)
    coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    coreGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.95)')
    coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
    ctx.fill()


    return new THREE.CanvasTexture(canvas)
  }



  /**
   * Create background starfield with twinkling effect
   */
  function createStarfield(): THREE.Points {
    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = []
    const colors: number[] = []
    const sizes: number[] = []
    const opacities: number[] = []
    const twinkleSpeeds: number[] = []
    const phases: number[] = []

    const starCount = 2000
    for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(150)
      const y = THREE.MathUtils.randFloatSpread(150)
      const z = THREE.MathUtils.randFloatSpread(150)
      vertices.push(x, y, z)

      const colorType = Math.random()
      if (colorType < 0.6) {
        colors.push(1, 1, 1)
      } else if (colorType < 0.85) {
        colors.push(0.8, 0.9, 1)
      } else {
        colors.push(1, 0.95, 0.8)
      }

      const size = THREE.MathUtils.randFloat(0.03, 0.15)
      sizes.push(size)

      const initialOpacity = THREE.MathUtils.randFloat(0.3, 1.0)
      opacities.push(initialOpacity)

      const twinkleSpeed = THREE.MathUtils.randFloat(0.5, 3.0)
      twinkleSpeeds.push(twinkleSpeed)

      const phase = THREE.MathUtils.randFloat(0, Math.PI * 2)
      phases.push(phase)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    // Store animation data for later use
    starfieldOpacities = new Float32Array(opacities)
    starfieldTwinkleSpeeds = new Float32Array(twinkleSpeeds)
    starfieldPhases = new Float32Array(phases)

    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    starfieldPoints = points
    return points
  }

  /**
   * Animate the starfield twinkling effect and mythology stars pulsing
   * Call this in your animation loop
   */
  function animateStarfield(time: number): void {
    // Animate background starfield twinkling
    if (starfieldPoints && starfieldOpacities && starfieldTwinkleSpeeds && starfieldPhases) {
      const geometry = starfieldPoints.geometry
      const sizes = geometry.getAttribute('size') as THREE.BufferAttribute
      const sizeArray = sizes.array as Float32Array

      // Update each star's size to create twinkling effect
      for (let i = 0; i < starfieldOpacities.length; i++) {
        const baseSize = starfieldOpacities[i]
        const speed = starfieldTwinkleSpeeds[i]
        const phase = starfieldPhases[i]

        if (baseSize === undefined || speed === undefined || phase === undefined) {
          continue
        }

        // Use sine wave for smooth twinkling
        const twinkle = Math.sin(time * 0.001 * speed + phase) * 0.5 + 0.5

        // Vary the size based on twinkle (some stars twinkle more than others)
        const sizeMultiplier = 0.7 + twinkle * 0.6
        sizeArray[i] = baseSize * sizeMultiplier * 0.1
      }

      sizes.needsUpdate = true
    }

    // Animate mythology stars with gentle pulsing
    mythologyStarData.forEach((data, star) => {
      const pulse = Math.sin(time * 0.001 * data.pulseSpeed + data.pulsePhase) * 0.5 + 0.5

      // Gentle breathing effect - stars pulse between 90% and 110% of their base size
      const scale = data.baseScale * (0.9 + pulse * 0.2)
      star.scale.set(scale, scale, 1)

      // Subtle opacity variation for extra life
      const material = star.material as THREE.SpriteMaterial
      material.opacity = 0.85 + pulse * 0.15
    })
  }

  /**
   * Initialize the mythology visualization
   */
  function init(mythData: StarData[]): void {
    // Clear previous data
    clearScene()

    // Add background starfield
    const starfield = createStarfield()
    scene.add(starfield)
    sceneObjects.push(starfield)

    // Create star texture once
    const starTexture = createStarTexture()

    // Calculate star importance metrics first to normalize sizing
    const importanceScores = mythData.map(data => data.relations.length)
    const maxImportance = Math.max(...importanceScores, 1)

    // Add mythology stars with enhanced visuals
    mythData.forEach((data) => {
      // Determine color based on domain cluster or mythology
      let colorHex = 0xffffff
      if (data.domainCluster) {
        const domainColor = getDomainColor(data.domainCluster)
        colorHex = parseInt(domainColor.replace('#', ''), 16)
      }

      // Calculate star importance based on number of relations (like star magnitude in real constellations)
      const importance = data.relations.length
      const brightnessMultiplier = Math.min(1.0, 0.5 + importance * 0.1) // Brighter for more connected deities

      const material = new THREE.SpriteMaterial({
        map: starTexture,
        color: colorHex,
        transparent: true,
        opacity: brightnessMultiplier,
        blending: THREE.AdditiveBlending, // Makes stars glow more intensely
        depthTest: true,
        depthWrite: false,
      })

      const star = new THREE.Sprite(material)

      // Vary star sizes based on importance (like magnitude in real constellations)
      // More connections = larger, brighter star (like alpha stars in constellations)
      // Use logarithmic scaling for more realistic magnitude differences
      const normalizedImportance = importance / maxImportance
      const baseScale = 0.5 + Math.pow(normalizedImportance, 0.6) * 1.2
      star.scale.set(baseScale, baseScale, 1)
      star.position.set(data.position.x, data.position.y, data.position.z)
      star.userData = data

      // Store animation data for this star
      mythologyStarData.set(star, {
        baseScale,
        pulseSpeed: THREE.MathUtils.randFloat(0.8, 2.0),
        pulsePhase: THREE.MathUtils.randFloat(0, Math.PI * 2),
      })

      stars.push(star)
      starMap.set(data.id, star)
      scene.add(star)
      sceneObjects.push(star)
    })

    // Create subtle halos around constellation clusters
    const clusterCenters = new Map<string, { center: THREE.Vector3; count: number; color: number }>()

    mythData.forEach((data) => {
      if (data.domainCluster) {
        if (!clusterCenters.has(data.domainCluster)) {
          const domainColor = getDomainColor(data.domainCluster)
          clusterCenters.set(data.domainCluster, {
            center: new THREE.Vector3(),
            count: 0,
            color: parseInt(domainColor.replace('#', ''), 16),
          })
        }
        const cluster = clusterCenters.get(data.domainCluster)!
        cluster.center.add(new THREE.Vector3(data.position.x, data.position.y, data.position.z))
        cluster.count++
      }
    })



    // Add connection lines between related deities (like constellation lines)
    mythData.forEach((data) => {
      data.relations.forEach((targetId) => {
        const start = starMap.get(data.id)?.position
        const end = starMap.get(targetId)?.position

        if (start && end) {
          const geometry = new THREE.BufferGeometry().setFromPoints([start, end])

          // Calculate distance between stars for varied line opacity
          const distance = start.distanceTo(end)
          // Closer stars = more visible connections (like patterns in real constellations)
          const distanceOpacity = Math.max(0.08, 0.3 - distance * 0.02)

          // Check if stars are in the same domain cluster for color coding
          const startStar = starMap.get(data.id)
          const endStar = starMap.get(targetId)
          const startData = startStar?.userData as StarData
          const endData = endStar?.userData as StarData

          let lineColor = 0x4a5568 // Default gray
          let lineOpacity = distanceOpacity

          // Make lines within same domain cluster more visible
          if (startData?.domainCluster && endData?.domainCluster &&
              startData.domainCluster === endData.domainCluster) {
            const clusterColor = getDomainColor(startData.domainCluster)
            lineColor = parseInt(clusterColor.replace('#', ''), 16)
            lineOpacity = distanceOpacity * 1.5 // More visible within clusters
          }

          const material = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: lineOpacity, // Use calculated opacity directly
            blending: THREE.NormalBlending,
            depthTest: true,
            depthWrite: false,
          })

          const line = new THREE.Line(geometry, material)
          scene.add(line)
          sceneObjects.push(line)
        }
      })
    })

    // Create labels for stars
    mythData.forEach((data) => {
      const div = document.createElement('div')
      div.className = 'mythology-label'
      div.textContent = data.name
      container.appendChild(div)

      const star = starMap.get(data.id)
      if (star) {
        labels.push({
          element: div,
          object: star,
        })
      }
    })
  }

  /**
   * Clear all scene objects and labels
   */
  function clearScene(): void {
    // Remove all scene objects
    sceneObjects.forEach((obj) => {
      scene.remove(obj)
      // Dispose geometries and materials
      const anyObj = obj as any
      if (anyObj.geometry) {
        anyObj.geometry.dispose()
      }
      if (anyObj.material) {
        if (Array.isArray(anyObj.material)) {
          anyObj.material.forEach((mat: any) => mat.dispose())
        } else {
          anyObj.material.dispose()
        }
      }
    })
    sceneObjects.length = 0

    // Remove all labels
    labels.forEach(({ element }) => {
      element.remove()
    })
    labels.length = 0

    // Clear arrays and maps
    stars.length = 0
    starMap.clear()

    // Clear starfield animation data
    starfieldPoints = null
    starfieldOpacities = null
    starfieldTwinkleSpeeds = null
    starfieldPhases = null

    // Clear mythology star animation data
    mythologyStarData.clear()
  }

  /**
   * Update label positions in screen space relative to canvas container
   */
  function updateLabels(): void {
    labels.forEach(({ element, object }) => {
      const pos = object.position.clone()
      pos.project(camera as THREE.PerspectiveCamera)

      // Use the renderer's size (not getBoundingClientRect which includes pixel ratio)
      const size = new THREE.Vector2()
      renderer.getSize(size)

      // Calculate position in screen pixels
      const x = (pos.x * 0.5 + 0.5) * size.x
      const y = (-pos.y * 0.5 + 0.5) * size.y - 20 // Offset labels higher above stars

      // Check if the star is visible (in front of camera = z < 1 and > -1)
      const isVisible = pos.z < 1 && pos.z > -1

      if (isVisible && x >= 0 && x <= size.x && y >= 0 && y <= size.y) {
        element.style.display = 'block'
        element.style.left = `${x}px`
        element.style.top = `${y}px`
      } else {
        element.style.display = 'none'
      }
    })
  }

  /**
   * Handle star clicks for information display
   */
  function onStarClick(event: MouseEvent, onStarSelected?: (data: StarData) => void): void {
    // Get the canvas bounds for accurate coordinate calculation
    const canvasRect = renderer.domElement.getBoundingClientRect()
    const canvasWidth = canvasRect.width
    const canvasHeight = canvasRect.height
    const canvasLeft = canvasRect.left
    const canvasTop = canvasRect.top

    // Calculate mouse position relative to the canvas
    const mouseX = event.clientX - canvasLeft
    const mouseY = event.clientY - canvasTop

    // Normalize to -1 to 1 range
    mouse.x = (mouseX / canvasWidth) * 2 - 1
    mouse.y = -(mouseY / canvasHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera as THREE.PerspectiveCamera)
    const intersects = raycaster.intersectObjects(stars)

    if (intersects.length > 0) {
      const intersection = intersects[0]
      if (intersection && intersection.object) {
        const starObject = intersection.object as THREE.Sprite
        const data = starObject.userData as StarData
        if (onStarSelected) {
          onStarSelected(data)
        }
      }
    }
  }

  /**
   * Clean up resources
   */
  function dispose(): void {
    clearScene()
  }

  return {
    init,
    clearScene,
    updateLabels,
    onStarClick,
    dispose,
    animateStarfield,
    getStars: () => stars,
    getStarMap: () => starMap,
  }
}

