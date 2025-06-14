class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load any assets needed for the loading screen
        // We don't actually need to load anything here for our simple implementation
        console.log('Boot Scene started');
    }

    create() {
        console.log('Boot Scene completed');
        this.scene.start('PreloadScene');
    }
}