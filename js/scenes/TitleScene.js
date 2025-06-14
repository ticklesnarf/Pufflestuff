class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        console.log('Title Scene started');
        
        // Add title background
        this.add.image(400, 300, 'title-bg');
        
        // Add game title
        const titleText = this.add.text(400, 150, 'Test Tube Match', {
            fontFamily: 'Courier New',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#c9b77d',
            stroke: '#4a412a',
            strokeThickness: 6
        });
        titleText.setOrigin(0.5);
        
        // Add subtitle
        const subtitleText = this.add.text(400, 210, 'Pufflestuff Edition', {
            fontFamily: 'Courier New',
            fontSize: '24px',
            color: '#a99a5b',
            stroke: '#4a412a',
            strokeThickness: 4
        });
        subtitleText.setOrigin(0.5);
        
        // Add play button
        const playButton = this.add.text(400, 300, 'PLAY', {
            fontFamily: 'Courier New',
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#8b7e4b',
            padding: {
                x: 20,
                y: 10
            },
            stroke: '#4a412a',
            strokeThickness: 4
        });
        playButton.setOrigin(0.5);
        playButton.setInteractive({ useHandCursor: true });
        
        // Button hover effects
        playButton.on('pointerover', () => {
            playButton.setBackgroundColor('#a99a5b');
            playButton.setScale(1.1);
        });
        
        playButton.on('pointerout', () => {
            playButton.setBackgroundColor('#8b7e4b');
            playButton.setScale(1);
        });
        
        // Button click event
        playButton.on('pointerdown', () => {
            console.log('Play button clicked, starting GameScene');
            this.scene.start('GameScene');
            console.log('GameScene start called');
        });
        
        // Instructions
        const instructionsText = this.add.text(400, 400, 
            'Click test tubes to select and swap\nMatch 3 or more to score points!', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center'
        });
        instructionsText.setOrigin(0.5);
        
        // Credits
        const creditsText = this.add.text(400, 550, 
            'A magical creation by Pufflestuff Studios', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#a99a5b',
            align: 'center'
        });
        creditsText.setOrigin(0.5);
        
        // For now, we'll skip audio and just log a message
        console.log('Title Scene ready - music would play here in the final version');
        
        // We could add a visual indicator that music would play
        const musicText = this.add.text(750, 570, '🔇', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        });
        musicText.setOrigin(0.5);
        
        // Add a little animation to it
        this.tweens.add({
            targets: musicText,
            y: musicText.y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
}