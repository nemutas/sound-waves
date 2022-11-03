import { registPageInstance } from '../scripts/utils'
import { Page } from '../types/types'
import { TCanvas } from './webgl/TCanvas'

class Home implements Page {
	private audio = document.querySelector<HTMLAudioElement>('audio')!
	private canvas: TCanvas

	constructor() {
		this.canvas = new TCanvas(document.body, this.audio)
		this.setPlay()
		this.setVolume()
	}

	private setPlay() {
		const play = document.querySelector<HTMLButtonElement>('.play')!

		window.addEventListener('mousemove', e => {
			play.style.top = '0'
			play.style.left = '0'
			play.style.setProperty('--x', `${e.clientX}px`)
			play.style.setProperty('--y', `${e.clientY}px`)
		})

		play.addEventListener('click', () => {
			play.style.display = 'none'
			this.audio.play()
		})
	}

	private setVolume(defaultValue = 1) {
		const volumeSlider = document.querySelector<HTMLInputElement>('.ui > input')!

		this.audio.volume = defaultValue
		volumeSlider.value = this.audio.volume.toString()

		volumeSlider.addEventListener('input', () => {
			this.audio.volume = volumeSlider.valueAsNumber
		})
	}

	dispose() {
		this.canvas.dispose()
	}
}

registPageInstance(new Home())
