import assetStore from '../Utils/AssetStore.js'
import { appStateStore } from '../Utils/Store.js'
import App from '../App.js'

export default class Preloader {
    constructor() {
        this.app = new App();  // Ensure this is supposed to create a new App or should be referencing an existing instance
        this.assetStore = assetStore;

        // access to DOM elements
        this.overlay = document.querySelector('.overlay');
        this.loading = document.querySelector('.loading');
        this.startButton = document.querySelector('.start');
        this.audioToggleButton = document.querySelector('.audio-toggle'); // Make sure this button is in your HTML

        if (this.audioToggleButton) {
            this.audioToggleButton.addEventListener('click', () => {
                if (this.app && this.app.world && this.app.world.environment) {
                    this.app.world.environment.toggleAudio(); // Toggle the audio on/off
                }
            });
        } else {
            console.error("Audio toggle button not found!");
        }

        this.assetStore.subscribe((state) => {
            this.numberOfLoadedAssets = Object.keys(state.loadedAssets).length;
            this.numberOfAssetsToLoad = state.assetsToLoad.length;
            this.progress = this.numberOfLoadedAssets / this.numberOfAssetsToLoad;
            this.progress = Math.trunc(this.progress * 100);
            document.getElementById('progressPercentage').innerHTML = this.progress;

            if (this.progress === 100) {
                appStateStore.setState({ assetsReady: true });
                this.loading.classList.add('fade');
                window.setTimeout(() => this.ready(), 1200);
            }
        });
    }

    ready() {
        this.loading.remove();
        this.startButton.style.display = 'inline';
        this.startButton.classList.add('fadeIn');

        this.startButton.addEventListener('click', () => {
            console.log('started');
            // Make the audio toggle visible
            const audioToggle = document.querySelector('.audio-toggle');
            audioToggle.style.display = 'inline'; // Change to 'inline' or 'block' to make visible
            audioToggle.style.opacity = 1; // Fade in the toggle button

            if (this.app && this.app.world && this.app.world.environment) {
                this.app.world.environment.enableAudio(); // Manage audio playback
            }
            this.overlay.classList.add('fade');
            this.startButton.classList.add('fadeOut');

            window.setTimeout(() => {
                this.overlay.remove();
                this.startButton.remove();
            }, 2000);
        }, { once: true });
    }
}