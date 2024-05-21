import { gsap } from 'gsap';

class InteractionManager {
    constructor(camera, positions) {
        this.camera = camera;
        this.positions = positions;
        this.currentIndex = 0;
        window.addEventListener('wheel', this.onScroll.bind(this));
    }

    onScroll(event) {
        if (event.deltaY > 0) {
            this.nextPosition();
        } else {
            this.previousPosition();
        }
    }

    nextPosition() {
        this.currentIndex++;
        if (this.currentIndex >= this.positions.length) {
            this.currentIndex = 0;
        }
        this.moveCamera();
    }

    previousPosition() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.positions.length - 1;
        }
        this.moveCamera();
    }

    moveCamera() {
        const position = this.positions[this.currentIndex];
        gsap.to(this.camera.position, {
            duration: 1,
            x: position.x,
            y: position.y,
            z: position.z,
            onUpdate: () => this.camera.updateProjectionMatrix()
        });
    }
}

export default InteractionManager;
