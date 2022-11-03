export interface Page {
	dispose: () => void
}

export type WaveData = {
	progress: number
	center: THREE.Vector2
	frequency: number
	amplitude: number
	speed: number
}
