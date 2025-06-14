// Add debug log
console.log('Starting game initialization');
console.log('BootScene exists:', typeof BootScene !== 'undefined');
console.log('PreloadScene exists:', typeof PreloadScene !== 'undefined');
console.log('TitleScene exists:', typeof TitleScene !== 'undefined');
console.log('GameScene exists:', typeof GameScene !== 'undefined');

// Configure the Phaser game
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000',
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, PreloadScene, TitleScene, GameScene]
};

// Create the game instance
console.log('Creating Phaser.Game instance');
const game = new Phaser.Game(config);
console.log('Game created:', game);
