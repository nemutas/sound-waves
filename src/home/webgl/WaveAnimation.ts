import gsap from 'gsap'
import * as THREE from 'three'
import { WaveData } from '../../types/types'

type WaveTL = {
	time: number
	frequency: number
	amplitude: number
	center?: [number, number]
	canPlay: boolean
}

export class WaveAnimation {
	private accents: WaveTL[] = []
	private accentIndex = 0
	private randomWaveTimeRange: { start: number; end: number }[] = []
	private randomIndex = 0
	private canRandomPlay = true

	constructor() {
		this.createTimeLines()
		this.createRandomTimeRange()
	}

	private createTimeLines() {
		let t = 0

		this.accents.push({ time: 0.5, frequency: 3, amplitude: 0.05, canPlay: true })
		this.accents.push({ time: 4.8, frequency: 3.5, amplitude: 0.15, canPlay: true })
		this.accents.push({ time: 6.5, frequency: 3, amplitude: 0.05, canPlay: true })
		this.accents.push({ time: 9.5, frequency: 3, amplitude: 0.1, canPlay: true })

		t = 12
		for (let i = 0; i < 4; i++) {
			this.accents.push({ time: t + 0.4, frequency: 3, amplitude: 0.15, canPlay: true })
			this.accents.push({ time: t + 0.7, frequency: 3, amplitude: 0.1, canPlay: true })
			this.accents.push({ time: t + 2.1, frequency: 3, amplitude: 0.1, canPlay: true })
			t += 3
		}

		t = 21.5
		for (let i = 0; i < 4; i++) {
			this.accents.push({ time: (t += 3), frequency: 3, amplitude: 0.15, canPlay: true })
		}

		t = 33.5
		for (let i = 0; i < 8; i++) {
			this.accents.push({ time: (t += 3), frequency: 3.8, amplitude: 0.2, canPlay: true })
		}

		t = 82.05
		for (let i = 0; i < 7; i++) {
			this.accents.push({ time: (t += 2.73), frequency: 3, amplitude: 0.15, canPlay: true })
			this.accents.push({ time: (t += 0.25), frequency: 3, amplitude: 0.1, canPlay: true })
		}

		t = 105.5
		this.accents.push({ time: (t += 0.02), frequency: 2.5, amplitude: 0.05, canPlay: true })
		this.accents.push({ time: (t += 0.12), frequency: 2.5, amplitude: 0.07, canPlay: true })
		this.accents.push({ time: (t += 0.22), frequency: 2.5, amplitude: 0.09, canPlay: true })
		this.accents.push({ time: (t += 0.32), frequency: 3.0, amplitude: 0.11, canPlay: true })
		this.accents.push({ time: (t += 0.42), frequency: 3.5, amplitude: 0.15, canPlay: true })
		this.accents.push({ time: (t += 0.53), frequency: 4.0, amplitude: 0.3, center: [0, 0], canPlay: true })

		t = 105.8
		for (let i = 0; i < 8; i++) {
			this.accents.push({ time: (t += 3), frequency: 2.5, amplitude: 0.15, canPlay: true })
		}

		t = 129.5
		for (let i = 0; i < 12; i++) {
			this.accents.push({ time: (t += 3), frequency: 3, amplitude: 0.2, canPlay: true })
		}

		this.accents.push({ time: 167, frequency: 4.0, amplitude: 0.3, center: [0, 0], canPlay: true })

		t = 174.5
		for (let i = 0; i < 3; i++) {
			this.accents.push({ time: (t += 6), frequency: 4, amplitude: 0.3, canPlay: true })
		}
	}

	private createRandomTimeRange() {
		this.randomWaveTimeRange.push({ start: 24.5, end: 34.0 })
		this.randomWaveTimeRange.push({ start: 60.0, end: 84.0 })
		this.randomWaveTimeRange.push({ start: 108.0, end: 132.0 })
		this.randomWaveTimeRange.push({ start: 144.5, end: 188.0 })
	}

	play(audioCurrentTime: number, accentWaves: WaveData[], randomWaves: WaveData[]) {
		if (audioCurrentTime === 0) {
			this.accentIndex = 0
			this.randomIndex = 0
		}

		// accent animation
		if (this.accentIndex < this.accents.length) {
			const tl = this.accents[this.accentIndex]
			if (tl.time < audioCurrentTime && tl.canPlay) {
				tl.canPlay = false
				this.createAccentAnimation(accentWaves[this.accentIndex % 5], tl)
				this.accentIndex++
			}
		}

		// random animation
		if (this.randomIndex < this.randomWaveTimeRange.length) {
			const range = this.randomWaveTimeRange[this.randomIndex]

			if (this.canRandomPlay && range.start < audioCurrentTime) {
				this.createRandomAnimation(randomWaves, range.end - range.start)
				this.canRandomPlay = false
			} else if (range.end < audioCurrentTime) {
				this.canRandomPlay = true
				this.randomIndex++
			}
		}
	}

	private createAccentAnimation(wave: WaveData, waveTL: WaveTL) {
		wave.frequency = waveTL.frequency
		wave.amplitude = waveTL.amplitude
		const aspect = window.innerWidth / window.innerHeight
		const cx = waveTL.center ? waveTL.center[0] : THREE.MathUtils.randFloatSpread(1 * aspect)
		const cy = waveTL.center ? waveTL.center[1] : THREE.MathUtils.randFloatSpread(1)
		wave.center.set(cx, cy)

		gsap.fromTo(
			wave,
			{ progress: 0 },
			{
				progress: 1,
				duration: 2,
				ease: 'none',
				onComplete: () => {
					waveTL.canPlay = true
				},
			},
		)
	}

	private createRandomAnimation(waves: WaveData[], totalDuration: number) {
		const aspect = window.innerWidth / window.innerHeight

		waves.forEach((wave, i) => {
			wave.frequency = 6
			wave.amplitude = 0.015
			wave.center.set(THREE.MathUtils.randFloatSpread(1 * aspect), THREE.MathUtils.randFloatSpread(1))

			gsap.fromTo(
				wave,
				{ progress: 0 },
				{ progress: 1, ease: 'none', duration: 2, delay: 0.1 * i, repeat: totalDuration / 2 },
			)
		})
	}
}
