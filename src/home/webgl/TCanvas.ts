import * as THREE from 'three'
import { TCanvasBase } from './TCanvasBase'
import planeVert from './shader/planeVert.glsl'
import planeFrag from './shader/planeFrag.glsl'
import { Assets, loadAssets } from './assetLoader'
import { resolvePath } from '../../scripts/utils'
import { WaveData } from '../../types/types'
import { WaveAnimation } from './WaveAnimation'
import gsap from 'gsap'
import { aspectQuery, isPc } from '../../scripts/mediaQuery'

const WaveAmount = 20

export class TCanvas extends TCanvasBase {
	private waveAniamtion!: WaveAnimation
	private passthroughTime = 0
	private imageMode: 'dark' | 'light' = 'dark'

	private assets: Assets = {
		image_dark: { path: resolvePath('resources/image_dark.png') },
		image_light: { path: resolvePath('resources/image_light.png') },
		image_sp_dark: { path: resolvePath('resources/image_sp_dark.png') },
		image_sp_light: { path: resolvePath('resources/image_sp_light.png') },
	}

	constructor(parentNode: ParentNode, private audio: HTMLAudioElement) {
		super(parentNode)

		loadAssets(this.assets).then(() => {
			this.setScene()
			this.createPlane()
			this.setResize()
			this.setQueryEvent()
			this.animate(this.update)
		})
	}
	// ---------------------------------
	private get imageDark() {
		const texture = isPc() ? this.assets.image_dark.data : this.assets.image_sp_dark.data
		return texture as THREE.Texture
	}

	private get imageLight() {
		const texture = isPc() ? this.assets.image_light.data : this.assets.image_sp_light.data
		return texture as THREE.Texture
	}

	private getMesh<T extends THREE.Material>(name: string) {
		return this.scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, T>
	}

	// ---------------------------------
	private setScene() {
		this.scene.background = new THREE.Color('#057')
		this.camera.position.z = 3

		this.waveAniamtion = new WaveAnimation()
		//
		;(this.assets.image_dark.data as THREE.Texture).wrapS = THREE.RepeatWrapping
		;(this.assets.image_dark.data as THREE.Texture).wrapT = THREE.RepeatWrapping
		;(this.assets.image_light.data as THREE.Texture).wrapS = THREE.RepeatWrapping
		;(this.assets.image_light.data as THREE.Texture).wrapT = THREE.RepeatWrapping
		;(this.assets.image_sp_dark.data as THREE.Texture).wrapS = THREE.RepeatWrapping
		;(this.assets.image_sp_dark.data as THREE.Texture).wrapT = THREE.RepeatWrapping
		;(this.assets.image_sp_light.data as THREE.Texture).wrapS = THREE.RepeatWrapping
		;(this.assets.image_sp_light.data as THREE.Texture).wrapT = THREE.RepeatWrapping
	}

	private createPlane() {
		const waveDatas: WaveData[] = [...Array(WaveAmount)].map(() => {
			return { progress: 0, center: new THREE.Vector2(0, 0), frequency: 0, amplitude: 0, speed: 5 }
		})

		const vertexShader = planeVert.replaceAll('WAVE_AMOUNT', WaveAmount.toString())

		const geometry = new THREE.PlaneGeometry(1, 1, 200, 200)
		const material = new THREE.ShaderMaterial({
			uniforms: {
				u_waves: { value: waveDatas },
				u_image: {
					value: {
						texture: this.imageDark,
						uvScale: this.calcCoveredTextureScale(this.imageDark, this.size.aspect),
					},
				},
				u_aspect: { value: this.size.aspect },
				u_time: { value: 0 },
				u_noiseTime: { value: 0 },
				u_uvOffset: { value: isPc() ? 0.25 : 0 },
				u_split: { value: 0 },
				u_progress: { value: 1 },
			},
			vertexShader: vertexShader,
			fragmentShader: planeFrag,
		})
		const mesh = new THREE.Mesh(geometry, material)
		const { width, height } = this.calcPerspectiveScreenSize()
		mesh.scale.set(width, height, 1)
		mesh.name = 'ripple'
		this.scene.add(mesh)
	}

	private createTransitionAnimation(mode: 'dark' | 'light') {
		const plane = this.getMesh<THREE.ShaderMaterial>('ripple')
		this.imageMode = mode
		const texture = mode === 'dark' ? this.imageDark : this.imageLight

		const tl = gsap.timeline({
			onComplete: () => {
				plane.material.uniforms.u_split.value = 0
				plane.material.uniforms.u_progress.value = 0
			},
		})
		tl.set(plane.material.uniforms.u_progress, { value: 1 })
		tl.set(plane.material.uniforms.u_split, { value: 2 })
		tl.set(plane.material.uniforms.u_split, { value: 4, delay: 0.28 })
		tl.set(plane.material.uniforms.u_split, { value: 8, delay: 0.25 })
		tl.set(plane.material.uniforms.u_split, { value: 16, delay: 0.21 })
		tl.set(plane.material.uniforms.u_split, { value: 32, delay: 0.18 })
		tl.set(plane.material.uniforms.u_image.value, { texture: texture, delay: 0.4 })
		tl.to(plane.material.uniforms.u_progress, { value: 0, delay: 0, duration: 1, ease: 'power2.in' }, '<')
	}

	private setResize() {
		this.resizeCallback = () => {
			const { width, height } = this.calcPerspectiveScreenSize()

			const plane = this.getMesh<THREE.ShaderMaterial>('ripple')
			plane.scale.set(width, height, 1)
			plane.material.uniforms.u_aspect.value = this.size.aspect
			const textureData = plane.material.uniforms.u_image.value
			this.calcCoveredTextureScale(textureData.texture, this.size.aspect, textureData.uvScale)
		}
	}

	private setQueryEvent() {
		aspectQuery.addEventListener('change', () => {
			const plane = this.getMesh<THREE.ShaderMaterial>('ripple')
			const textureData = plane.material.uniforms.u_image.value
			const texture = this.imageMode === 'dark' ? this.imageDark : this.imageLight
			textureData.texture = texture
			this.calcCoveredTextureScale(textureData.texture, this.size.aspect, textureData.uvScale)

			plane.material.uniforms.u_uvOffset.value = isPc() ? 0.25 : 0
		})
	}

	private update = () => {
		const dt = this.clock.getDelta()
		const plane = this.getMesh<THREE.ShaderMaterial>('ripple')

		if (!this.audio.paused) {
			plane.material.uniforms.u_time.value += dt
		}
		plane.material.uniforms.u_noiseTime.value += dt

		// wave animation
		const waves = plane.material.uniforms.u_waves.value
		this.waveAniamtion.play(this.audio.currentTime, waves.slice(0, 5), waves.slice(5))

		// image transition
		if (this.audio.currentTime === 0) this.passthroughTime = 0

		if (this.passthroughTime < 105.5 && 105.5 < this.audio.currentTime) {
			this.passthroughTime = this.audio.currentTime
			this.createTransitionAnimation('light')
		}

		if (this.passthroughTime < 166 && 166 < this.audio.currentTime) {
			this.passthroughTime = this.audio.currentTime
			this.createTransitionAnimation('dark')
		}
	}
}
