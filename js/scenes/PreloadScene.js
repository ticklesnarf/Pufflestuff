class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        console.log('Preload Scene started');
        
        // Create loading bar
        this.createLoadingBar();

        // Load background music
        this.load.audio('background_music', 'assets/audio/magical_theme.mp3');
        
        // createProgrammaticAssets() is no longer called here, createTextures() is called on load 'complete'.
        // console.log('PreloadScene: createProgrammaticAssets called - this is mostly for textures now.');

        // Explicitly start the loader
        console.log('PreloadScene: Kicking off Phaser loader with this.load.start()');
        this.load.start();
    }

    createLoadingBar() {
        // Display loading progress
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Listen for the load complete event
        this.load.on('complete', () => {
            console.log('PreloadScene: All assets loaded.');
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.createTextures(); // Create textures after loading is complete
            this.scene.start('TitleScene');
        });

        // Update loading bar based on actual progress (optional, but good practice)
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x8b7e4b, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        // Add a load error listener
        this.load.on('loaderror', function(file) {
            console.error('PreloadScene: Error loading file:', file.key, file.url, file);
        });
    }

    createProgrammaticAssets() {
        console.log('PreloadScene: createProgrammaticAssets called - this is mostly for textures now.');
        // Textures are created in createTextures() after load completion.
        // Actual asset loading (like audio) is handled by Phaser's loader in preload().
    }
    
    createTextures() {
        // Create a background texture - olive-gold colored dorm room
        const bgGraphics = this.make.graphics({x: 0, y: 0, add: false});
        bgGraphics.fillStyle(0x665d33); // olive-gold base
        bgGraphics.fillRect(0, 0, 800, 600);
        
        // Add some darker areas for furniture
        bgGraphics.fillStyle(0x4a412a);
        bgGraphics.fillRect(50, 300, 300, 250); // desk
        bgGraphics.fillRect(400, 100, 350, 200); // window area
        
        // Add lighter areas for light sources
        bgGraphics.fillStyle(0xc9b77d);
        bgGraphics.fillRect(600, 350, 100, 100); // desk lamp light
        bgGraphics.fillRect(450, 150, 250, 100); // window moonlight
        
        // Generate the texture
        bgGraphics.generateTexture('background', 800, 600);
        
        // Title background - similar but with more vignette
        const titleBgGraphics = this.make.graphics({x: 0, y: 0, add: false});
        titleBgGraphics.fillStyle(0x3d3821); // darker olive-gold
        titleBgGraphics.fillRect(0, 0, 800, 600);
        
        // Create a lighter area in the center
        titleBgGraphics.fillStyle(0x665d33);
        titleBgGraphics.fillCircle(400, 300, 200);
        
        // Generate the texture
        titleBgGraphics.generateTexture('title-bg', 800, 600);
        
        // Create a potion texture
        const potionGraphics = this.make.graphics({x: 0, y: 0, add: false});
        // Potion bottle
        potionGraphics.fillStyle(0x336699);
        potionGraphics.fillRect(10, 15, 30, 35);
        potionGraphics.fillStyle(0x884422);
        potionGraphics.fillRect(15, 5, 20, 10);
        // Potion glow
        potionGraphics.fillStyle(0x00ffff, 0.5);
        potionGraphics.fillCircle(25, 30, 20);
        
        potionGraphics.generateTexture('potion', 50, 50);
        
        // Create wizard sprite - simpler approach with single frame
        const wizardSize = { width: 48, height: 64 };
        const wizardGraphics = this.make.graphics({x: 0, y: 0, add: false});
        
        // Create a single frame for testing
        // Body
        wizardGraphics.fillStyle(0xf4d1a6);
        wizardGraphics.fillRect(14, 20, 20, 30);
        
        // Head
        wizardGraphics.fillCircle(24, 15, 10);
        
        // Hat
        wizardGraphics.fillStyle(0xe3b486);
        wizardGraphics.fillTriangle(
            14, 10,
            34, 10,
            24, -5
        );
        
        // Robes
        wizardGraphics.fillStyle(0xd4a97a);
        wizardGraphics.fillRect(10, 40, 28, 15);
        
        // Generate a simple texture without frame numbers
        wizardGraphics.generateTexture('wizard', wizardSize.width, wizardSize.height);
        
        // Also create a simple potion collector texture for testing
        const collectorGraphics = this.make.graphics({x: 0, y: 0, add: false});
        collectorGraphics.fillStyle(0x00ff00);
        collectorGraphics.fillCircle(25, 25, 25);
        collectorGraphics.generateTexture('collector', 50, 50);

        // Create animations
        this.createAnimations();
    }

    createAnimations() {
        // With a single frame, we'll use that frame for all animations
        // Wizard animations
        this.anims.create({
            key: 'wizard-idle',
            frames: [{ key: 'wizard', frame: 0 }],
            frameRate: 6,
            repeat: -1
        });
        
        this.anims.create({
            key: 'wizard-left',
            frames: [{ key: 'wizard', frame: 0 }],
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'wizard-right',
            frames: [{ key: 'wizard', frame: 0 }],
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'wizard-up',
            frames: [{ key: 'wizard', frame: 0 }],
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.create({
            key: 'wizard-down',
            frames: [{ key: 'wizard', frame: 0 }],
            frameRate: 10,
            repeat: -1
        });
    }
}