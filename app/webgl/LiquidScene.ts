import * as THREE from 'three'
import { simplexNoise3D } from './noise'
import { DEFAULT_STATE, SCENE_PALETTES, resolvePreset, type SceneState, type SceneTheme } from './scenePresets'

const ACCENT = new THREE.Color('#c8ff5a')
const VIOLET = new THREE.Color('#7b5cff')
const WHITE = new THREE.Color('#ffffff')

const STATE_KEYS = Object.keys(DEFAULT_STATE) as (keyof SceneState)[]

/** Palette parsed once into THREE.Colors so the frame loop only lerps. */
const parsePalette = (theme: SceneTheme) => {
  const p = SCENE_PALETTES[theme]
  return { ...p, rimA: new THREE.Color(p.rimA), rimB: new THREE.Color(p.rimB), base: new THREE.Color(p.base), tint: new THREE.Color(p.tint) }
}

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))

export interface LiquidSceneOptions {
  reducedMotion?: boolean
  theme?: SceneTheme
}

/**
 * Framework-agnostic WebGL scene: a liquid-chrome blob with satellite droplets.
 * Vue only creates it, forwards input (pointer / scroll velocity / section) and disposes it.
 */
export class LiquidScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  private lastTime = 0
  private blob!: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhysicalMaterial>
  private satellites: THREE.Mesh[] = []
  private satelliteGroup = new THREE.Group()
  private satelliteMaterial!: THREE.MeshPhysicalMaterial
  private envTarget: THREE.WebGLRenderTarget | null = null
  private frame = 0
  private running = false
  private reducedMotion: boolean

  private viewport = { width: 1, height: 1, worldW: 1, worldH: 1, mobile: false }
  private current: SceneState = { ...DEFAULT_STATE, scale: 0 }
  private target: SceneState = resolvePreset('hero')
  private pointer = new THREE.Vector2()
  private pointerSmooth = new THREE.Vector2()
  private velocity = 0
  private appear = 0
  private elapsed = 0
  private tmp = new THREE.Vector3()

  // theme cross-fade: 0 = dark, 1 = light
  private palettes = { dark: parsePalette('dark'), light: parsePalette('light') }
  private themeMix = 0
  private themeTarget = 0
  private rimA = new THREE.Color()
  private rimB = new THREE.Color()
  private base = new THREE.Color()
  private tint = new THREE.Color()

  private uniforms = {
    uTime: { value: 0 },
    uDistort: { value: DEFAULT_STATE.distort },
    uFrequency: { value: DEFAULT_STATE.frequency },
    uPointer: { value: new THREE.Vector3(0, 0, 1) },
    uPointerForce: { value: 0 },
    uRim: { value: 0.6 },
    uRimColor: { value: ACCENT.clone() }
  }

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, options: LiquidSceneOptions = {}) {
    this.canvas = canvas
    this.reducedMotion = !!options.reducedMotion
    this.themeMix = this.themeTarget = options.theme === 'light' ? 1 : 0

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05

    this.camera.position.set(0, 0, 6)

    this.buildEnvironment()
    this.buildBlob()
    this.buildSatellites()
    this.resize()
  }

  /** Studio-like environment: dark room with bright strip lights → crisp chrome reflections. */
  private buildEnvironment() {
    const env = new THREE.Scene()
    env.background = new THREE.Color('#050506')

    const strip = (color: THREE.Color, intensity: number, w: number, h: number, pos: THREE.Vector3Tuple, rot: THREE.Vector3Tuple) => {
      const mat = new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(intensity), side: THREE.DoubleSide })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
      mesh.position.set(...pos)
      mesh.rotation.set(...rot)
      env.add(mesh)
    }

    // key softboxes
    strip(WHITE, 5, 14, 0.8, [0, 5, -1], [Math.PI / 2.3, 0, 0])
    strip(WHITE, 3.5, 0.7, 12, [-5.5, 0, 1.5], [0, Math.PI / 2.2, 0])
    strip(WHITE, 2.2, 0.35, 12, [5.5, 0, -1.5], [0, -Math.PI / 2.2, 0])
    strip(WHITE, 1.6, 0.25, 12, [-3, 0, -5.5], [0, 0.4, 0])
    strip(WHITE, 1.6, 0.25, 12, [3, 0, -5.5], [0, -0.4, 0])
    // coloured bounce
    strip(ACCENT, 2.6, 3, 7, [5, -1, 3.5], [0, -Math.PI / 3, 0])
    strip(VIOLET, 2.4, 5, 5, [-4.5, -2, -4], [0, Math.PI / 4, 0])
    // faint floor so the underside is not pitch black
    strip(new THREE.Color('#8a90a0'), 0.35, 20, 20, [0, -6, 0], [-Math.PI / 2, 0, 0])

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.envTarget = pmrem.fromScene(env, 0.035)
    this.scene.environment = this.envTarget.texture
    pmrem.dispose()
    env.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose()
        ;(o.material as THREE.Material).dispose()
      }
    })
  }

  private buildBlob() {
    const geometry = new THREE.IcosahedronGeometry(1, 48)
    const material = new THREE.MeshPhysicalMaterial({
      color: WHITE,
      metalness: 1,
      roughness: 0.07,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 720],
      envMapIntensity: 1.25
    })

    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms)

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          /* glsl */ `#include <common>
          uniform float uTime;
          uniform float uDistort;
          uniform float uFrequency;
          uniform vec3 uPointer;
          uniform float uPointerForce;
          ${simplexNoise3D}

          vec3 liquid(vec3 p) {
            vec3 n = normalize(p);
            float t = uTime * 0.32;
            // two smooth octaves + a slow domain warp = viscous, liquid motion
            vec3 q = p * uFrequency;
            vec3 warp = vec3(snoise(q * 0.6 + t * 0.35), snoise(q * 0.6 - t * 0.3 + 7.1), 0.0);
            float wave = snoise(q + warp * 0.55 + vec3(t, t * 0.6, -t * 0.4));
            wave += 0.22 * snoise(q * 1.9 - vec3(t * 0.7));
            float bulge = pow(max(dot(n, normalize(uPointer)), 0.0), 5.0) * uPointerForce;
            return p + n * (wave * 0.24 * uDistort + bulge * 0.22);
          }`
        )
        .replace(
          '#include <beginnormal_vertex>',
          /* glsl */ `
          vec3 lqBase = normalize(position);
          vec3 lqUp = abs(lqBase.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
          vec3 lqTangent = normalize(cross(lqBase, lqUp));
          vec3 lqBitangent = normalize(cross(lqBase, lqTangent));
          float lqEps = 0.012;
          vec3 lqP0 = liquid(position);
          vec3 lqP1 = liquid(normalize(position + lqTangent * lqEps));
          vec3 lqP2 = liquid(normalize(position + lqBitangent * lqEps));
          vec3 objectNormal = normalize(cross(lqP1 - lqP0, lqP2 - lqP0));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3(tangent.xyz);
          #endif`
        )
        .replace('#include <begin_vertex>', 'vec3 transformed = lqP0;')

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          /* glsl */ `#include <common>
          uniform float uRim;
          uniform vec3 uRimColor;`
        )
        .replace(
          '#include <opaque_fragment>',
          /* glsl */ `
          float lqFresnel = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);
          outgoingLight += uRimColor * lqFresnel * uRim;
          #include <opaque_fragment>`
        )
    }
    material.customProgramCacheKey = () => 'liquid-blob-v1'

    this.blob = new THREE.Mesh(geometry, material)
    this.scene.add(this.blob)
  }

  private buildSatellites() {
    const material = (this.satelliteMaterial = new THREE.MeshPhysicalMaterial({
      color: WHITE,
      metalness: 1,
      roughness: 0.12,
      iridescence: 0.8,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.1
    }))
    const geometry = new THREE.SphereGeometry(1, 48, 48)
    const configs = [
      { radius: 0.16, orbit: 1.85, speed: 0.42, phase: 0, tilt: 0.4 },
      { radius: 0.09, orbit: 2.25, speed: -0.3, phase: 2.1, tilt: -0.6 },
      { radius: 0.12, orbit: 1.6, speed: 0.55, phase: 4.2, tilt: 1.1 }
    ]
    for (const c of configs) {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData = c
      this.satellites.push(mesh)
      this.satelliteGroup.add(mesh)
    }
    this.scene.add(this.satelliteGroup)
  }

  // ---------------------------------------------------------------- public API

  /** Move the blob toward a named section preset (see scenePresets.ts). */
  setSection(name: string) {
    this.target = resolvePreset(name)
  }

  /** Pointer in normalised device coordinates (-1 … 1). */
  setPointer(x: number, y: number) {
    this.pointer.set(x, y)
  }

  /** Scroll velocity from Lenis (px / frame); excites the surface. */
  setVelocity(v: number) {
    this.velocity = THREE.MathUtils.clamp(Math.abs(v) / 40, 0, 1)
  }

  /** Cross-fade the blob palette (~0.6 s). Instant under reduced motion or when `instant`. */
  setTheme(theme: SceneTheme, instant = false) {
    this.themeTarget = theme === 'light' ? 1 : 0
    if (instant || this.reducedMotion) this.themeMix = this.themeTarget
  }

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth
    const height = this.canvas.clientHeight || window.innerHeight
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    const worldH = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z
    this.viewport = { width, height, worldH, worldW: worldH * this.camera.aspect, mobile: width < 768 }
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    const loop = () => {
      if (!this.running) return
      this.frame = requestAnimationFrame(loop)
      this.update()
    }
    loop()
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.frame)
  }

  dispose() {
    this.stop()
    this.blob.geometry.dispose()
    this.blob.material.dispose()
    this.satellites[0]?.geometry.dispose()
    this.satelliteMaterial?.dispose()
    this.envTarget?.dispose()
    this.renderer.dispose()
  }

  // ---------------------------------------------------------------- frame

  private update() {
    const now = performance.now()
    const dt = Math.min((now - this.lastTime) / 1000, 1 / 20)
    this.lastTime = now
    const speed = this.reducedMotion ? 0.15 : 1
    this.elapsed += dt * speed

    // intro: grow from nothing with an expo-out curve
    this.appear = Math.min(1, this.appear + dt / 1.8)
    const appearEase = 1 - Math.pow(2, -10 * this.appear)

    const c = this.current
    const t = this.target
    const k = 2.4
    for (const key of STATE_KEYS) c[key] = damp(c[key], t[key], k, dt)

    this.pointerSmooth.x = damp(this.pointerSmooth.x, this.pointer.x, 4, dt)
    this.pointerSmooth.y = damp(this.pointerSmooth.y, this.pointer.y, 4, dt)
    this.velocity = damp(this.velocity, 0, 3, dt)

    const { worldW, worldH, mobile } = this.viewport
    const xFactor = mobile ? 0.15 : 1
    const baseRadius = Math.min(worldH * 0.27, worldW * (mobile ? 0.34 : 0.3))
    const radius = baseRadius * c.scale * (mobile ? 0.85 : 1) * appearEase

    this.blob.position.set(c.x * (worldW / 2) * xFactor, c.y * (worldH / 2) + (mobile ? worldH * 0.08 : 0), 0)
    this.blob.scale.setScalar(Math.max(radius, 0.0001))
    this.blob.rotation.y += dt * (c.spin + this.velocity * 0.8) * speed
    this.blob.rotation.x = damp(this.blob.rotation.x, -this.pointerSmooth.y * 0.35, 3, dt)
    this.blob.rotation.z = damp(this.blob.rotation.z, this.pointerSmooth.x * 0.15, 3, dt)

    const u = this.uniforms
    u.uTime.value = this.elapsed
    u.uDistort.value = c.distort + this.velocity * 0.45
    u.uFrequency.value = c.frequency
    // pointer bulge, expressed in the blob's local space
    this.blob.updateMatrixWorld()
    const local = this.blob.worldToLocal(this.tmp.set(this.pointerSmooth.x * worldW * 0.5, this.pointerSmooth.y * worldH * 0.5, 2))
    if (local.lengthSq() > 1e-6) u.uPointer.value.copy(local)
    u.uPointerForce.value = damp(u.uPointerForce.value, this.reducedMotion ? 0 : 0.6, 2, dt)

    // theme palette (damp 5 ≈ 95 % in 0.6 s)
    this.themeMix = damp(this.themeMix, this.themeTarget, 5, dt)
    const m = this.themeMix
    const dark = this.palettes.dark
    const light = this.palettes.light
    const lerp = THREE.MathUtils.lerp
    this.rimA.lerpColors(dark.rimA, light.rimA, m)
    this.rimB.lerpColors(dark.rimB, light.rimB, m)
    this.base.lerpColors(dark.base, light.base, m)
    this.tint.lerpColors(dark.tint, light.tint, m)
    const envIntensity = lerp(dark.envIntensity, light.envIntensity, m)
    this.blob.material.envMapIntensity = envIntensity
    this.satelliteMaterial.envMapIntensity = envIntensity * 0.88
    this.renderer.toneMappingExposure = lerp(dark.exposure, light.exposure, m)

    u.uRim.value = lerp(dark.rimMin, light.rimMin, m) + c.tint * lerp(dark.rimScale, light.rimScale, m)
    u.uRimColor.value.copy(this.rimA).lerp(this.rimB, 0.5 + 0.5 * Math.sin(this.elapsed * 0.25))

    this.blob.material.color.copy(this.base).lerp(this.tint, c.tint * lerp(dark.tintAmount, light.tintAmount, m))

    // satellites orbit the blob
    this.satelliteGroup.position.copy(this.blob.position)
    for (const s of this.satellites) {
      const d = s.userData as { radius: number; orbit: number; speed: number; phase: number; tilt: number }
      const a = this.elapsed * d.speed + d.phase
      const orbit = d.orbit * radius
      s.position.set(Math.cos(a) * orbit, Math.sin(a * 1.3) * orbit * 0.35 + Math.sin(d.tilt) * 0.2, Math.sin(a) * orbit)
      s.scale.setScalar(Math.max(d.radius * radius * c.satellites, 0.0001))
    }

    this.renderer.render(this.scene, this.camera)
  }
}
