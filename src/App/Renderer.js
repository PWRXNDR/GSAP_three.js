import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import App from './App.js';
import { sizesStore } from './Utils/Store.js';

export default class Renderer {
    constructor() {
        this.app = new App();
        this.canvas = this.app.canvas;
        this.camera = this.app.camera;
        this.scene = this.app.scene;
        this.sizesStore = sizesStore;
        this.sizes = this.sizesStore.getState();

        this.setInstance();
        this.setComposer();
        this.setResizeLister();
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
        });
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
        this.instance.toneMapping = THREE.ACESFilmicToneMapping;
        this.instance.toneMappingExposure = 1.0;
    }

    setComposer() {
        this.composer = new EffectComposer(this.instance);
        this.composer.addPass(new RenderPass(this.scene, this.camera.instance));

        if (this.shouldEnableBloom()) {
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.sizes.width, this.sizes.height), 1.5, 0.4, 0.85);
            bloomPass.threshold = 0.11;
            bloomPass.strength = 0.55;
            bloomPass.radius = 0.1;
            this.composer.addPass(bloomPass);
        }

        if (this.shouldEnableFXAA()) {
            const fxaaPass = new ShaderPass(FXAAShader);
            fxaaPass.material.uniforms['resolution'].value.set(1 / this.sizes.width, 1 / this.sizes.height);
            this.composer.addPass(fxaaPass);
        }

        this.composer.addPass(new FilmPass(0.35, 0.025, 648, false));
    }

    shouldEnableBloom() {
        return performance.now() % 1 === 0;  // Example condition, replace with actual performance metric
    }

    shouldEnableFXAA() {
        return performance.now() % 1 === 0;  // Example condition, replace with actual performance metric
    }


    setResizeLister() {
        this.sizesStore.subscribe((sizes) => {
            this.instance.setSize(sizes.width, sizes.height);
            this.instance.setPixelRatio(sizes.pixelRatio);
            this.composer.setSize(sizes.width, sizes.height);

            // Update FXAA pass resolution
            const fxaaPass = this.composer.passes.find(pass => pass instanceof ShaderPass && pass.material.uniforms['resolution']);
            if (fxaaPass) {
                fxaaPass.material.uniforms['resolution'].value.set(1 / sizes.width, 1 / sizes.height);
            }
        });
    }

    loop() {
        this.composer.render();
    }
}
