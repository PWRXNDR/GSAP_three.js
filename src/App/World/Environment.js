import * as THREE from "three";
import App from "../App.js";
import assetStore from "../Utils/AssetStore.js";
import { PositionalAudio } from 'three';
import gsap from 'gsap';
import studio from "@theatre/studio";
import * as core from '@theatre/core'

export default class Environment {
    constructor() {
        this.app = new App();
        if (!this.app.renderer) {
            console.error('Renderer is not initialized');
            return;
        }
        this.scene = this.app.scene;
        this.physics = this.app.world.physics;
        this.pane = this.app.gui.pane;
        this.camera = this.app.camera;

        this.assetStore = assetStore.getState()
        this.environment = this.assetStore.loadedAssets.environment
        this.audioListener = new THREE.AudioListener();
        // Ensure the camera instance is available and properly initialized
        if (this.app.camera && this.app.camera.instance) {
            this.app.camera.instance.add(this.audioListener);
        } else {
            console.error("Camera instance is not available for adding AudioListener");
        }

        this.positions = [
           new THREE.Vector3(0, 20, 100),
           new THREE.Vector3(20.32, 26.06, 33.77), //start smooth path
           new THREE.Vector3(33.53, 21.81, 14.76),
           new THREE.Vector3(-8.24, 3.24, -15.87), //end smooth path
           new THREE.Vector3(5.80, 8.45, 22.73),
           new THREE.Vector3(9.98, 39.24, 12.38),
           new THREE.Vector3(13.28, 13.57, 17.74),
           new THREE.Vector3(-32.46, 27.03, 63.97),
        ];
        this.smoothPathIndices = [1, 2, 3];
        this.currentPositionIndex = 0;
        this.isTransitioning = false; 

        this.loadEnvironment();
        this.addLights();
        this.addSpotlight();
        this.addFog();
        this.setupAudio(false);
        this.setupScroll();

        this.camera.moveToPosition(this.positions[0]);
    }

    setupScroll() {
        window.addEventListener('wheel', (event) => {
            if (this.isTransitioning) return; // Ignore scrolls during transitions

            const nextIndex = event.deltaY > 0 ? (this.currentPositionIndex + 1) % this.positions.length : (this.currentPositionIndex - 1 + this.positions.length) % this.positions.length;

            // Check if the next position is within the smooth path
            if (this.smoothPathIndices.includes(nextIndex) && this.smoothPathIndices.includes(this.currentPositionIndex)) {
                this.smoothCameraTransition(nextIndex);
            } else {
                this.moveToPosition(nextIndex);
            }
        });
    }

    moveToPosition(index) {
        this.isTransitioning = true;
        gsap.to(this.camera.instance.position, {
            duration: 1,
            x: this.positions[index].x,
            y: this.positions[index].y,
            z: this.positions[index].z,
            ease: 'power1.inOut',
            onComplete: () => {
                this.isTransitioning = false;
            }
        });
        this.currentPositionIndex = index;
    }

    smoothCameraTransition(nextIndex) {
        this.isTransitioning = true;
        const path = this.positions.slice(Math.min(this.currentPositionIndex, nextIndex), Math.max(this.currentPositionIndex, nextIndex) + 1);
        const timeline = gsap.timeline({
            onComplete: () => this.isTransitioning = false
        });

        path.forEach((position, i) => {
            timeline.to(this.camera.instance.position, {
                duration: 1.5, // Adjust duration as needed
                x: position.x,
                y: position.y,
                z: position.z,
                ease: 'expoScale(0.5, 7, none)' // Using expoScale ease for smooth effect
            }, i * 0); // Adjust stagger timing as needed
        });

        this.currentPositionIndex = nextIndex;
    }

    setupAudio(play = false) {
        const pianoMusic = new PositionalAudio(this.audioListener);
        const audioBuffer = this.assetStore.loadedAssets.pianoMusic;
        if (!audioBuffer) {
            console.error('Audio buffer is not loaded');
            return;
        }
        pianoMusic.setBuffer(audioBuffer);
        pianoMusic.setRefDistance(20);
        pianoMusic.setLoop(true);
        pianoMusic.setVolume(0.5);

        this.pianoMusic = pianoMusic;

        const piano = this.scene.getObjectByName('Grand_piano');
        if (piano) {
            piano.add(pianoMusic);
            if (play) {
                pianoMusic.play();
            }
        } else {
            console.error('Piano object not found in the scene');
        }
    }

    enableAudio() {
        if (this.audioListener.context.state === 'suspended') {
            this.audioListener.context.resume().then(() => {
                console.log("AudioContext resumed!");
                this.pianoMusic.play();
            }).catch(error => {
                console.error("Error resuming audio context:", error);
            });
        } else if (this.pianoMusic && !this.pianoMusic.isPlaying) {
            this.pianoMusic.play();
        }
    }

    toggleAudio() {
        if (this.pianoMusic.isPlaying) {
            this.pianoMusic.pause();
        } else {
            this.enableAudio(); // Reuses the enableAudio method to play if it was paused
        }
    }

    loadEnvironment() {
        // load environment here
        const environmentScene = this.environment.scene;
        this.scene.add(environmentScene);
        let allObjects = []; // Array to store names of all objects

        environmentScene.traverse((child) => {
            console.log(child.name);
            allObjects.push(child.name);
        });

        const godRaysMaterial = new THREE.MeshBasicMaterial({
            color: 0xfffb70,
            transparent: true,
            opacity: 0.01,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        environmentScene.traverse((object) => {
            if (object.name === 'god_rays') {
                object.material = godRaysMaterial;
            }
        });

        const cubeTextureLoader = new THREE.CubeTextureLoader();
        cubeTextureLoader.setPath('/textures/cubeMap/');
        const backgroundCubemap = cubeTextureLoader.load([
            'px.png',
            'nx.png',
            'py.png',
            'ny.png',
            'pz.png',
            'nz.png'
        ], (cubemap) => {
            this.scene.background = cubemap;

            environmentScene.traverse((child) => {
                if (child.name === 'Plane061') { 
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.2, // metalness to control reflectivity
                        roughness: 0.05, // lower values give sharper reflections
                        envMap: cubemap 
                    });
                }
            });

            environmentScene.traverse((child) => {
                if (child.name === 'Plane050') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.1,
                        roughness: 0.15,
                        envMap: cubemap
                    });
                }
            });

            environmentScene.traverse((child) => {
                if (child.name === 'Plane060') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.1,
                        roughness: 0.15,
                        envMap: cubemap
                    });
                }
            });

            environmentScene.traverse((child) => {
                if (child.name === 'Plane057') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.1,
                        roughness: 0.15,
                        envMap: cubemap
                    });
                }
            });

            environmentScene.traverse((child) => {
                if (child.name === 'Plane055') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.1,
                        roughness: 0.15,
                        envMap: cubemap
                    });
                }
            });

            environmentScene.traverse((child) => {
                if (child.name === 'Plane045') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.1,
                        roughness: 0.15,
                        envMap: cubemap
                    });
                }
            });

            environmentScene.traverse((child) => {
                if (child.name === 'Walls') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0xbbb39b,
                        metalness: 0,
                        roughness: 0.6,
                        envMap: cubemap
                    });
                }
            });

            environmentScene.traverse((child) => {
                if (child.name === 'Plane049') {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x000000,
                        metalness: 0.8,
                        roughness: 0.2
                    });
                }
            });

                    environmentScene.traverse((child) => {
            if (child.name === 'floor') { 
                // Access and modify the existing material
                if (child.material) {
                    child.material.metalness = 0; 
                    child.material.roughness = 0.1; 
                }
            }
        });
        });

        environmentScene.traverse((child) => {
            if (child.name === 'floor') { 
                // Access and modify the existing material
                if (child.material) {
                    child.material.metalness = 0; // Adjust as necessary
                    child.material.roughness = 0.05; // Adjust as necessary
                }
            }
        });


        environmentScene.position.set(-8, 0, 38)
        environmentScene.rotation.set(0, -.30, 0)
        environmentScene.scale.setScalar(1.3)

        const physicalObjects = ['Grand_piano',
        ]

        const shadowCasters = ['Grand_piano',
        ]

        const shadowReceivers = ['floor',
        ]

        for (const child of environmentScene.children) {
            const isPhysicalObject = physicalObjects.some((keyword) => child.name.includes(keyword))
            if (isPhysicalObject) {
                child.traverse((obj) => {
                    if (obj.isMesh) {
                        this.physics.add(obj, "fixed", "cuboid")
                    }
                })
            }

            const isShadowCaster = shadowCasters.some((keyword) => child.name.includes(keyword))
            if (isShadowCaster) {
                child.traverse((obj) => {
                    if (obj.isMesh) {
                        obj.castShadow = true
                    }
                })
            }

            const isShadowReceiver = shadowReceivers.some((keyword) => child.name.includes(keyword))
            if (isShadowReceiver) {
                child.traverse((obj) => {
                    if (obj.isMesh) {
                        obj.receiveShadow = true
                    }
                })
            }
        }

    }

    addLights() {
        // Subdued ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(ambientLight);

        // Directional light for general lighting with soft intensity
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);

        // Optional: Additional point lights or soft spotlights
        const pointLight = new THREE.PointLight(0xfffb70, 0.1, 100, 1);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }

    addSpotlight() {
        const spotlight = new THREE.SpotLight(0xfffb70, 0.5, 0, Math.PI / 8, 0.5, 2);
        spotlight.position.set(10, 60, 10); // Adjust as necessary
        spotlight.target.position.set(10, 0, 10);
        this.scene.add(spotlight.target);
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 1024;
        spotlight.shadow.mapSize.height = 1024;
        spotlight.shadow.camera.near = 0.5;
        spotlight.shadow.camera.far = 150;
        this.scene.add(spotlight);
    }

    addFog() {
        const color = 0x63a9ff;  // Choose a color that blends well with your scene
        const density = 0.001;    // Control the density, smaller values for lighter fog

        this.scene.fog = new THREE.FogExp2(color, density);
    }

}
