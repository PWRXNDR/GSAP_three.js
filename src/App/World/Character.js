import * as THREE from "three";
import assetStore from "../Utils/AssetStore.js";

import App from "../App.js";

export default class Character {
    constructor() {
        this.app = new App();
        this.scene = this.app.scene;
        this.assetStore = assetStore.getState();
        this.avatar = this.assetStore.loadedAssets.avatar; // Ensure the avatar is correctly loaded

        this.instantiateCharacter();
    }

    instantiateCharacter() {
        if (this.avatar && this.avatar.scene) {
            // Scale the avatar
            this.avatar.scene.scale.set(8, 8, 8);

            // Set position
            this.avatar.scene.position.set(0, 0, 15);

            // Rotate if necessary
            this.avatar.scene.rotation.y = Math.PI * 0.58;

            // Enable wireframe for the avatar
            this.avatar.scene.traverse((obj) => {
                if (obj.isMesh) {
                    // Set the wireframe material
                    obj.material = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.1,
                        wireframe: true
                    });
                }
            });

            // Add the avatar to the scene
            this.scene.add(this.avatar.scene);
        } else {
            console.error("Avatar is not loaded or does not exist in the asset store.");
        }
    }
}