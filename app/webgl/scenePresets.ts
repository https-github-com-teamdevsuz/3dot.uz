/**
 * Each page section declares `data-scene="<name>"`. When it scrolls into view
 * the liquid blob eases toward that preset. Coordinates are viewport-relative:
 * x = -1 … 1 (left … right edge), y = -1 … 1 (bottom … top edge).
 */
export interface SceneState {
  x: number
  y: number
  scale: number
  /** amplitude of the noise displacement */
  distort: number
  /** spatial frequency of the noise */
  frequency: number
  /** 0 = chrome, 1 = fully tinted with accent colour */
  tint: number
  /** extra spin applied on the Y axis (radians / second) */
  spin: number
  /** opacity of the satellite droplets */
  satellites: number
}

export const DEFAULT_STATE: SceneState = {
  x: 0,
  y: 0,
  scale: 1,
  distort: 0.45,
  frequency: 0.63,
  tint: 0,
  spin: 0.12,
  satellites: 1
}

export const SCENE_PRESETS: Record<string, Partial<SceneState>> = {
  hero: { x: 0.18, y: 0.02, scale: 1.18, distort: 0.5, frequency: 0.73, tint: 0, satellites: 1 },
  intro: { x: 0.62, y: 0.05, scale: 0.78, distort: 0.32, frequency: 0.98, tint: 0.15, satellites: 0.6 },
  services: { x: -0.66, y: 0.1, scale: 0.62, distort: 0.75, frequency: 1.26, tint: 0.05, satellites: 0.3 },
  stats: { x: -0.62, y: -0.62, scale: 0.6, distort: 0.4, frequency: 0.63, tint: 0.35, satellites: 1 },
  projects: { x: 0.5, y: 0.66, scale: 0.26, distort: 0.25, frequency: 0.91, tint: 0.6, satellites: 0 },
  expertise: { x: -0.6, y: 0, scale: 0.85, distort: 0.55, frequency: 0.84, tint: 0.2, satellites: 0.8 },
  process: { x: 0.66, y: 0, scale: 0.7, distort: 0.3, frequency: 1.12, tint: 0, satellites: 0.5 },
  faq: { x: -0.7, y: -0.1, scale: 0.5, distort: 0.6, frequency: 1.47, tint: 0.4, satellites: 0.2 },
  contact: { x: 0, y: -0.05, scale: 1.35, distort: 0.85, frequency: 0.59, tint: 0.8, satellites: 1 },
  detail: { x: 0.68, y: 0.35, scale: 0.55, distort: 0.4, frequency: 0.98, tint: 0.5, satellites: 0.4 }
}

export function resolvePreset(name: string | undefined | null): SceneState {
  return { ...DEFAULT_STATE, ...(name ? SCENE_PRESETS[name] : undefined) }
}

// ---------------------------------------------------------------- theme palettes

export type SceneTheme = 'dark' | 'light'

export interface ScenePalette {
  /** rim (fresnel) colour oscillates between rimA and rimB */
  rimA: string
  rimB: string
  /** blob base colour (chrome = near white) */
  base: string
  /** colour the blob is tinted toward by `SceneState.tint` */
  tint: string
  /** uRim = rimMin + tint * rimScale */
  rimMin: number
  rimScale: number
  /** how far `tint` pulls the base toward the tint colour */
  tintAmount: number
  /** blob envMapIntensity (satellites use 0.88×) */
  envIntensity: number
  exposure: number
}

export const SCENE_PALETTES: Record<SceneTheme, ScenePalette> = {
  // identical to the pre-theme constants
  dark: { rimA: '#c8ff5a', rimB: '#7b5cff', base: '#ffffff', tint: '#c8ff5a', rimMin: 0.25, rimScale: 0.9, tintAmount: 0.35, envIntensity: 1.25, exposure: 1.05 },
  // darker inks so the rim reads on #f4f3ee; the dark studio env keeps the body high-contrast
  light: { rimA: '#5f8a00', rimB: '#5a3be0', base: '#f2f2f2', tint: '#7fb800', rimMin: 0.15, rimScale: 0.63, tintAmount: 0.45, envIntensity: 1.0, exposure: 0.95 }
}
