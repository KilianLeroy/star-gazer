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

  // Fog configuration for fade effect
  const FOG_NEAR = 20
  const FOG_FAR = 80
  const LABEL_FADE_START = 20
  const LABEL_FADE_END = 80

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

    const outerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 64)
    outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    outerGlow.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)')
    outerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
    outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = outerGlow
    ctx.fillRect(0, 0, 128, 128)

    ctx.save()
    ctx.translate(centerX, centerY)

    const hFlare = ctx.createLinearGradient(-60, 0, 60, 0)
    hFlare.addColorStop(0, 'rgba(255, 255, 255, 0)')
    hFlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)')
    hFlare.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = hFlare
    ctx.fillRect(-60, -2, 120, 4)

    const vFlare = ctx.createLinearGradient(0, -60, 0, 60)
    vFlare.addColorStop(0, 'rgba(255, 255, 255, 0)')
    vFlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)')
    vFlare.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = vFlare
    ctx.fillRect(-2, -60, 4, 120)

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
    if (starfieldPoints && starfieldOpacities && starfieldTwinkleSpeeds && starfieldPhases) {
      const geometry = starfieldPoints.geometry
      const sizes = geometry.getAttribute('size') as THREE.BufferAttribute
      const sizeArray = sizes.array as Float32Array

      for (let i = 0; i < starfieldOpacities.length; i++) {
        const baseSize = starfieldOpacities[i]
        const speed = starfieldTwinkleSpeeds[i]
        const phase = starfieldPhases[i]

        if (baseSize === undefined || speed === undefined || phase === undefined) {
          continue
        }

        const twinkle = Math.sin(time * 0.001 * speed + phase) * 0.5 + 0.5

        const sizeMultiplier = 0.7 + twinkle * 0.6
        sizeArray[i] = baseSize * sizeMultiplier * 0.1
      }

      sizes.needsUpdate = true
    }

    mythologyStarData.forEach((data, star) => {
      const pulse = Math.sin(time * 0.001 * data.pulseSpeed + data.pulsePhase) * 0.5 + 0.5

      const scale = data.baseScale * (0.9 + pulse * 0.2)
      star.scale.set(scale, scale, 1)

      const material = star.material as THREE.SpriteMaterial
      material.opacity = 0.85 + pulse * 0.15
    })
  }

  /**
   * Initialize the mythology visualization
   */
  function init(mythData: StarData[]): void {
    clearScene()

    scene.fog = new THREE.Fog(0x000510, FOG_NEAR, FOG_FAR)

    const starfield = createStarfield()
    scene.add(starfield)
    sceneObjects.push(starfield)

    const starTexture = createStarTexture()

    const importanceScores = mythData.map(data => data.relations.length)
    const maxImportance = Math.max(...importanceScores, 1)

    mythData.forEach((data) => {
      let colorHex = 0xffffff
      if (data.domainCluster) {
        const domainColor = getDomainColor(data.domainCluster)
        colorHex = parseInt(domainColor.replace('#', ''), 16)
      } else {
        // Assign colors based on mythology
        switch (data.mythology) {
          case 'Greek':
            colorHex = 0x00BFFF // Deep sky blue
            break
          case 'Norse':
            colorHex = 0x9370DB // Medium purple
            break
          case 'Egyptian':
            colorHex = 0xFFA500 // Orange/gold
            break
          case 'Hindu':
            colorHex = 0xFF4500 // Orange red
            break
          case 'Celtic':
            colorHex = 0x32CD32 // Lime green
            break
          default:
            colorHex = 0xffffff // White
        }
      }

      const importance = data.relations.length
      const brightnessMultiplier = Math.min(1.0, 0.5 + importance * 0.1) // Brighter for more connected deities

      const material = new THREE.SpriteMaterial({
        map: starTexture,
        color: colorHex,
        transparent: true,
        opacity: brightnessMultiplier,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
      })

      const star = new THREE.Sprite(material)


      const normalizedImportance = importance / maxImportance
      const baseScale = 0.5 + Math.pow(normalizedImportance, 0.6) * 1.2
      star.scale.set(baseScale, baseScale, 1)
      star.position.set(data.position.x, data.position.y, data.position.z)
      star.userData = data

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



    mythData.forEach((data) => {
      data.relations.forEach((targetId) => {
        const start = starMap.get(data.id)?.position
        const end = starMap.get(targetId)?.position

        if (start && end) {
          const geometry = new THREE.BufferGeometry().setFromPoints([start, end])

          const distance = start.distanceTo(end)
          const distanceOpacity = Math.max(0.08, 0.3 - distance * 0.02)

          const startStar = starMap.get(data.id)
          const endStar = starMap.get(targetId)
          const startData = startStar?.userData as StarData
          const endData = endStar?.userData as StarData

          let lineColor = 0x4a5568
          let lineOpacity = distanceOpacity

          if (startData?.domainCluster && endData?.domainCluster &&
              startData.domainCluster === endData.domainCluster) {
            const clusterColor = getDomainColor(startData.domainCluster)
            lineColor = parseInt(clusterColor.replace('#', ''), 16)
            lineOpacity = distanceOpacity * 1.5
          }

          const material = new THREE.LineBasicMaterial({
            color: lineColor,
            transparent: true,
            opacity: lineOpacity,
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
    sceneObjects.forEach((obj) => {
      scene.remove(obj)
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

    labels.forEach(({ element }) => {
      element.remove()
    })
    labels.length = 0

    stars.length = 0
    starMap.clear()

    starfieldPoints = null
    starfieldOpacities = null
    starfieldTwinkleSpeeds = null
    starfieldPhases = null

    mythologyStarData.clear()
  }

  /**
   * Update label positions in screen space relative to canvas container
   */
  function updateLabels(): void {
    const cameraPos = (camera as THREE.PerspectiveCamera).position

    labels.forEach(({ element, object }) => {
      const pos = object.position.clone()
      pos.project(camera as THREE.PerspectiveCamera)

      const size = new THREE.Vector2()
      renderer.getSize(size)

      const x = (pos.x * 0.5 + 0.5) * size.x
      const y = (-pos.y * 0.5 + 0.5) * size.y - 20

      const isVisible = pos.z < 1 && pos.z > -1

      const distanceFromCamera = cameraPos.distanceTo(object.position)
      let opacity = 1.0

      if (distanceFromCamera > LABEL_FADE_START) {
        if (distanceFromCamera >= LABEL_FADE_END) {
          opacity = 0
        } else {
          opacity = 1 - (distanceFromCamera - LABEL_FADE_START) / (LABEL_FADE_END - LABEL_FADE_START)
        }
      }

      if (isVisible && x >= 0 && x <= size.x && y >= 0 && y <= size.y && opacity > 0) {
        element.style.display = 'block'
        element.style.left = `${x}px`
        element.style.top = `${y}px`
        element.style.opacity = opacity.toString()
      } else {
        element.style.display = 'none'
      }
    })
  }

  /**
   * Handle star clicks for information display
   */
  function onStarClick(event: MouseEvent, onStarSelected?: (data: StarData) => void): void {
    const canvasRect = renderer.domElement.getBoundingClientRect()
    const canvasWidth = canvasRect.width
    const canvasHeight = canvasRect.height
    const canvasLeft = canvasRect.left
    const canvasTop = canvasRect.top

    const mouseX = event.clientX - canvasLeft
    const mouseY = event.clientY - canvasTop

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

