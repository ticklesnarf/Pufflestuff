class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        console.log('GameScene constructor called');
    }

    init() {
        // Initialize variables
        this.score = 0;
        this.gameOver = false;
        this.matchTarget = 6969; // Target score to win
        
        // Board dimensions
        this.boardWidth = 8;
        this.boardHeight = 8;
        this.tileSize = 40;
        
        // Tile array
        this.tiles = [];
        
        // Emoji pieces for our game
        this.emojiTypes = ['⚗️', '🧪', '🔮', '⏰'];
        console.log('Emoji types:', this.emojiTypes);
        
        // Selection tracking
        this.selectedTile = null;
        
        // Flag to control if player can move
        this.canMove = false;
        
        console.log('GameScene initialized with magical emojis');
    }

    create() {
        try {
            console.log('Match-3 Game Scene started');
            
            // Add background
            this.background = this.add.rectangle(400, 300, 800, 600, 0x6b6335); // Olive background
            console.log('Background added');
            
            // Initialize board variables first
            this.tiles = [];
            for (let x = 0; x < this.boardWidth; x++) {
                this.tiles[x] = [];
            }
            
            // Create the game board
            this.createBoard();
            console.log('Board created');
            
            // Setup input handling
            this.setupInput();
            console.log('Input set up');
            
            // Add UI
            this.createUI();
            console.log('UI created');
            
            // Add ambient effects
            this.createSmokeEffects();
            console.log('Smoke effects created');
            
            // Play background music
            console.log('GameScene: Attempting to play background music.');
            console.log('GameScene: Available audio keys in cache:', this.sys.cache.audio.getKeys()); // Log all keys

            if (this.sys.cache.audio.has('background_music')) {
                if (!this.music || !this.music.isPlaying) { // Check if music is already playing
                this.music = this.sound.add('background_music', { 
                    loop: true,
                    volume: 0.3 // Adjust volume as needed (0.0 to 1.0)
                });
                this.music.play();
                console.log('GameScene: Background music playback initiated.');
            }
            } else {
                console.error('GameScene: CRITICAL - Audio key "background_music" still NOT FOUND in cache at the moment of playing!');
            }
            
            // createBoard() -> checkMatches(true) -> shuffleMatches() will handle initial setup and            
            console.log('GameScene initialization complete, awaiting board stabilization for moves.');


        } catch (e) {
            console.error('Error in GameScene.create():', e);
        }
    }

    update() {
        if (this.gameOver) return;
        
        // In Match-3, most of our logic is event-driven rather than per-frame
        // So we don't need much in the update method
    }

    createBoard() {
        try {
            console.log('Creating board...');
            // Create a container to hold all our board elements
            this.boardContainer = this.add.container(400 - (this.boardWidth * this.tileSize) / 2, 300 - (this.boardHeight * this.tileSize) / 2);
            
            // Create a background for our board
            const boardBackground = this.add.rectangle(
                (this.boardWidth * this.tileSize) / 2, 
                (this.boardHeight * this.tileSize) / 2,
                this.boardWidth * this.tileSize + 10,
                this.boardHeight * this.tileSize + 10,
                0x553311, // Dark brown background
                0.7       // Semi-transparent
            );
            this.boardContainer.add(boardBackground);
            
            console.log('Creating tiles...');
            // Fill the board with test tubes
            for (let x = 0; x < this.boardWidth; x++) {
                for (let y = 0; y < this.boardHeight; y++) {
                    // Choose a random emoji for our tile
                    const emojiIndex = Phaser.Math.Between(0, this.emojiTypes.length - 1);
                    const pixelX = x * this.tileSize + this.tileSize / 2;
                    const pixelY = y * this.tileSize + this.tileSize / 2;

                    // Create a container for this tile
                    const container = this.add.container(pixelX, pixelY);
                    this.boardContainer.add(container);

                    // Create the emoji text
                    const emoji = this.emojiTypes[emojiIndex];
                    const emojiText = this.add.text(0, 0, emoji, {
                        fontSize: '32px',
                        fontFamily: 'Arial, sans-serif'
                    }).setOrigin(0.5);
                    container.add(emojiText);

                    // Add properties to our tile
                    container.gridX = x;
                    container.gridY = y;
                    container.emojiIndex = emojiIndex;

                    // Store in our tiles array
                    this.tiles[x][y] = container;

                    // Make it interactive
                    container.setSize(this.tileSize, this.tileSize);
                    container.setInteractive();
                    container.on('pointerdown', () => {
                        this.selectTile(container);
                    });

                    // Add a little wobble animation
                    this.tweens.add({
                        targets: container,
                        angle: '-=2',
                        duration: 1000 + Math.random() * 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
            
            console.log('Board created successfully');
            // Check for and resolve any initial matches before allowing moves
            this.checkMatches(true);
        } catch (e) {
            console.error('Error in createBoard:', e);
        }
    }
    
    shuffleMatches() {
        console.log('[shuffleMatches] Called. Current canMove:', this.canMove);
        // Find all matches on the board
        let matches = this.findMatches();
        
        // If there are matches on initial creation, replace some tiles
        if (matches.length > 0) {
            matches.forEach(match => {
                // Get the middle tile of the match and change its emoji
                const middleIndex = Math.floor(match.length / 2);
                const tile = match[middleIndex];
                
                let newEmojiIndex;
                do {
                    newEmojiIndex = Phaser.Math.Between(0, this.emojiTypes.length - 1);
                } while (newEmojiIndex === tile.emojiIndex);
                
                // Update the tile with the new emoji
                this.updateTileEmoji(tile, newEmojiIndex);
            });
            
            // Check again after a brief delay
            this.time.delayedCall(100, () => {
                this.shuffleMatches();
            });
        } else {
            // No more matches, the board is ready
            console.log('[shuffleMatches] No more matches. Setting canMove = true.');
            this.canMove = true;
        }
    }

    updateTileEmoji(tile, newEmojiIndex) {
        if (!tile || tile.list === undefined || tile.list.length === 0) {
            console.error('Invalid tile or tile has no text child:', tile);
            return;
        }
        tile.emojiIndex = newEmojiIndex;
        const emojiText = tile.list[0]; // Assuming the text object is the first child
        if (emojiText && typeof emojiText.setText === 'function') {
            emojiText.setText(this.emojiTypes[newEmojiIndex]);
        } else {
            console.error('Emoji text object not found or setText is not a function on:', emojiText, 'for tile:', tile);
        }
    }
    
    addTile(x, y) {
        // Choose a random emoji type
        const emojiIndex = Phaser.Math.Between(0, this.emojiTypes.length - 1);
        
        // Create a tile with the emoji at the given grid position
        const tile = this.createTestTube(x, y, null, emojiIndex);
        
        // Store in our tiles array
        this.tiles[x][y] = tile;
        
        return tile;
    }
    
    createTestTube(x, y, color, emojiIndex) {
        // Calculate pixel position from grid coordinates
        const pixelX = x * this.tileSize + this.tileSize / 2;
        const pixelY = y * this.tileSize + this.tileSize / 2;
        
        // Create a container for this tile
        const container = this.add.container(pixelX, pixelY);
        this.boardContainer.add(container);
        
        // Create the emoji text
        const emoji = this.emojiTypes[emojiIndex];
        const emojiText = this.add.text(0, 0, emoji, {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Add to container
        container.add(emojiText);
        
        // Store additional properties with the container
        container.gridX = x;
        container.gridY = y;
        container.emojiIndex = emojiIndex;
        container.setSize(this.tileSize, this.tileSize); // Interactive size
        container.setInteractive();
        container.on('pointerdown', () => {
            this.selectTile(container);
        });
        
        // Add a subtle wobble animation
        this.tweens.add({
            targets: container,
            angle: 5,
            duration: 500 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add scale animation for more dynamic feel
        this.tweens.add({
            targets: emojiText,
            scale: 1.1,
            duration: 700 + Math.random() * 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Math.random() * 200
        });
        
        return container;
    }
    
    setupInput() {
        console.log('[setupInput] Called. Relying on per-tile input handlers from createBoard.');
        // Temporarily disabling global input handler to rely on per-tile listeners
        /*
        console.log('Setting up input handlers');
        
        // We need to directly handle pointerdown events on our tile containers
        this.input.on('pointerdown', (pointer) => {
            if (!this.canMove) return;
            
            // Convert pointer position to board-relative coordinates
            const boardX = pointer.x - this.boardContainer.x;
            const boardY = pointer.y - this.boardContainer.y;
            
            // Calculate grid coordinates
            const gridX = Math.floor(boardX / this.tileSize);
            const gridY = Math.floor(boardY / this.tileSize);
            
            // Check if valid grid position
            if (gridX >= 0 && gridX < this.boardWidth && gridY >= 0 && gridY < this.boardHeight) {
                const tile = this.tiles[gridX][gridY];
                if (tile) {
                    console.log(`Tile clicked at grid position ${gridX}, ${gridY}`);
                    this.selectTile(tile);
                }
            }
        });
        
        console.log('Input handlers set up successfully');
        */
    }

    selectTile(tile) {
        console.log(`[selectTile] Called with tile at (${tile.gridX}, ${tile.gridY}). this.canMove: ${this.canMove}. Previously selected:`, this.selectedTile);
        // If no tile is currently selected, select this one
        if (!this.selectedTile) {
            this.selectedTile = tile;
            // Visual indication of selection
            this.showSelection(tile);
            return;
        }
        
        // If this is the same tile, deselect it
        if (this.selectedTile === tile) {
            this.clearSelection();
            return;
        }
        
        // Check if the tiles are adjacent
        const dx = Math.abs(tile.gridX - this.selectedTile.gridX);
        const dy = Math.abs(tile.gridY - this.selectedTile.gridY);
        
        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            // Tiles are adjacent, try to swap them
            this.swapTiles(this.selectedTile, tile);
        } else {
            // Tiles are not adjacent, select the new tile instead
            this.clearSelection();
            this.selectedTile = tile;
            this.showSelection(tile);
        }
    }
    
    showSelection(tile) {
        // Create visual selection indicator
        if (this.selectionIndicator) this.selectionIndicator.destroy();
        
        this.selectionIndicator = this.add.circle(tile.x, tile.y, this.tileSize / 2 + 5, 0xffffff, 0.5);
        this.boardContainer.add(this.selectionIndicator);
        this.selectionIndicator.setDepth(-1); // Place behind the tile
        
        // Pulse animation for selection
        this.tweens.add({
            targets: this.selectionIndicator,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    clearSelection() {
        if (this.selectionIndicator) {
            this.selectionIndicator.destroy();
            this.selectionIndicator = null;
        }
        this.selectedTile = null;
    }
    
    swapTiles(tile1, tile2) {
        console.log(`[swapTiles] Called for tiles at (${tile1.gridX}, ${tile1.gridY}) and (${tile2.gridX}, ${tile2.gridY}). this.canMove: ${this.canMove}`);
        if (!this.canMove) return;
        
        // Prevent further moves during animation
        this.canMove = false;
        
        // Swap grid positions
        const tempX = tile1.gridX;
        const tempY = tile1.gridY;
        
        // Update the grid positions in the objects
        tile1.gridX = tile2.gridX;
        tile1.gridY = tile2.gridY;
        tile2.gridX = tempX;
        tile2.gridY = tempY;
        
        // Update the grid array
        this.tiles[tile1.gridX][tile1.gridY] = tile1;
        this.tiles[tile2.gridX][tile2.gridY] = tile2;
        
        // Animate the swap
        this.tweens.add({
            targets: tile1,
            x: tile2.x,
            y: tile2.y,
            duration: 200,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: tile2,
            x: tile1.x,
            y: tile1.y,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // The tweens have already updated the visual positions.
                // Clear selection
                this.clearSelection();
                
                // Check for matches
                this.checkMatches();
            }
        });
    }

    checkMatches(isInitialCheck = false) {
        console.log(`[checkMatches] Called. isInitialCheck: ${isInitialCheck}. Current canMove: ${this.canMove}`);
        // Find all matches on the board
        let matches = this.findMatches();
        
        // If this is an initial check during board creation, just reshuffle any matches
        if (isInitialCheck && matches.length > 0) {
            matches.forEach(match => {
                const middleIndex = Math.floor(match.length / 2);
                const tile = match[middleIndex];
                let newEmojiIndex;
                do {
                    newEmojiIndex = Phaser.Math.Between(0, this.emojiTypes.length - 1);
                } while (newEmojiIndex === tile.emojiIndex);
                this.updateTileEmoji(tile, newEmojiIndex);
            });
            this.time.delayedCall(100, () => {
                this.checkMatches(true);
            });
            return;
        }
        
        // If no matches, allow the player to move again
        if (matches.length === 0) {
            console.log('[checkMatches-Gameplay] No active matches. Setting canMove = true.');
            this.canMove = true;
            return;
        }
        
        // Process all the matches
        let totalPoints = 0;
        matches.forEach(match => {
            const matchScore = match.length * 10;
            totalPoints += matchScore;
            match.forEach(tile => {
                this.tweens.add({
                    targets: tile,
                    alpha: 0.2,
                    yoyo: true,
                    duration: 200,
                    onComplete: () => {
                        this.removeTile(tile);
                    }
                });
                const scoreText = this.add.text(tile.x, tile.y, '+' + (matchScore / match.length), {
                    fontSize: '20px',
                    fill: '#fff'
                }).setOrigin(0.5);
                this.boardContainer.add(scoreText);
                this.tweens.add({
                    targets: scoreText,
                    y: scoreText.y - 30,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => scoreText.destroy()
                });
            });
        });
        // Update the score
        this.score += totalPoints;
        this.updateScoreUI();
        // After a delay for animations, drop tiles to fill gaps
        this.time.delayedCall(500, () => {
            this.dropTiles();
        });
    }

    findMatches() {
        const matches = [];
        
        // Check horizontal matches
        for (let y = 0; y < this.boardHeight; y++) {
            let matchingTiles = [];
            let currentEmojiIndex = -1;
            
            for (let x = 0; x < this.boardWidth; x++) {
                const tile = this.tiles[x][y];
                if (!tile) continue;
                
                if (tile.emojiIndex === currentEmojiIndex) {
                    matchingTiles.push(tile);
                } else {
                    // If we had a match of 3 or more, add it to matches
                    if (matchingTiles.length >= 3) {
                        matches.push([...matchingTiles]);
                    }
                    
                    // Start a new potential match
                    matchingTiles = [tile];
                    currentEmojiIndex = tile.emojiIndex;
                }
            }
            
            // Check for match at the end of the row
            if (matchingTiles.length >= 3) {
                matches.push([...matchingTiles]);
            }
        }
        
        // Check vertical matches
        for (let x = 0; x < this.boardWidth; x++) {
            let matchingTiles = [];
            let currentEmojiIndex = -1;
            
            for (let y = 0; y < this.boardHeight; y++) {
                const tile = this.tiles[x][y];
                if (!tile) continue;
                
                if (tile.emojiIndex === currentEmojiIndex) {
                    matchingTiles.push(tile);
                } else {
                    // If we had a match of 3 or more, add it to matches
                    if (matchingTiles.length >= 3) {
                        matches.push([...matchingTiles]);
                    }
                    
                    // Start a new potential match
                    matchingTiles = [tile];
                    currentEmojiIndex = tile.emojiIndex;
                }
            }
            
            // Check for match at the end of the column
            if (matchingTiles.length >= 3) {
                matches.push([...matchingTiles]);
            }
        }
        
        return matches;
    }

    removeTile(tile) {
        if (!tile) return;
        console.log(`[removeTile] Removing tile at (${tile.gridX}, ${tile.gridY})`);
        // Mark the grid position as empty
        if (this.tiles[tile.gridX] && this.tiles[tile.gridX][tile.gridY]) {
            this.tiles[tile.gridX][tile.gridY] = null;
        }
        // Destroy the tile's game object (the container)
        tile.destroy();
    }

    dropTiles() {
        let tileMoved = false;
        
        // Drop tiles column by column, starting from the bottom
        for (let x = 0; x < this.boardWidth; x++) {
            // Count empty spaces below each tile
            let emptySpaces = 0;
            
            for (let y = this.boardHeight - 1; y >= 0; y--) {
                // If this is an empty space, increment counter
                if (!this.tiles[x][y]) {
                    emptySpaces++;
                    continue;
                }
                
                // If there are empty spaces below, drop this tile
                if (emptySpaces > 0) {
                    const tile = this.tiles[x][y];
                    const newY = y + emptySpaces;
                    
                    // Update the grid position
                    tile.gridY = newY;
                    this.tiles[x][y] = null;
                    this.tiles[x][newY] = tile;
                    
                    // Animate the drop
                    this.tweens.add({
                        targets: tile,
                        y: tile.y + (emptySpaces * this.tileSize),
                        duration: 200,
                        ease: 'Bounce.easeOut'
                    });
                    
                    tileMoved = true;
                }
            }
            
            // Fill in the top with new tiles
            for (let y = 0; y < emptySpaces; y++) {
                this.addTile(x, y);
                tileMoved = true;
            }
        }
        
        // If any tiles were moved, check for new matches after animations complete
        if (tileMoved) {
            this.time.delayedCall(300, () => {
                this.checkMatches();
            });
        } else {
            // No tiles moved, allow player to move again
            console.log('[dropTiles] No tiles moved. Setting canMove = true.');
            this.canMove = true;
            
            // Check if the player has reached the target score
            if (this.score >= this.matchTarget && !this.gameOver) {
                this.gameWin();
            }
        }
    }

    createUI() {
        // Score text
        this.scoreText = this.add.text(20, 20, 'Score: 0/' + this.matchTarget, {
            fontFamily: 'Courier New',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff',
            stroke: '#4a412a',
            strokeThickness: 4
        });
    }
    
    updateScoreUI() {
        this.scoreText.setText('Score: ' + this.score + '/' + this.matchTarget);
    }

    createSmokeEffects() {
        // Create simple smoke particles using basic shapes instead of textures
        // This avoids issues with texture loading
        
        // First smoke source (joint/ashtray)
        const smoke1 = this.add.circle(350, 300, 5, 0xcccccc, 0.5);
        this.tweens.add({
            targets: smoke1,
            y: smoke1.y - 30,
            alpha: 0,
            scale: 3,
            duration: 2000,
            repeat: -1
        });
        
        // Second smoke source (potion)
        const smoke2 = this.add.circle(450, 400, 5, 0xaaddff, 0.5);
        this.tweens.add({
            targets: smoke2,
            y: smoke2.y - 30,
            alpha: 0,
            scale: 3,
            duration: 2500,
            repeat: -1
        });
    }

    gameWin() {
        // Set game over flag
        this.gameOver = true;
        
        // Create semi-transparent background
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        
        // Create win message
        const winText = this.add.text(400, 280, 'Pufflestuff House >', { // Adjusted Y position
            fontFamily: 'Courier New',
            fontSize: '48px', // Adjusted font size for new message
            fontWeight: 'bold',
            color: '#c9b77d',
            stroke: '#4a412a',
            strokeThickness: 6
        });
        winText.setOrigin(0.5);
        
        // Show score
        const scoreText = this.add.text(400, 300, 'Score: ' + this.score, {
            fontFamily: 'Courier New',
            fontSize: '28px',
            color: '#fff',
            stroke: '#4a412a',
            strokeThickness: 4
        });
        scoreText.setOrigin(0.5);
        scoreText.setVisible(false); // Hide the separate score text on win screen

        // Add play again button
        const playAgainButton = this.add.text(400, 380, 'PLAY AGAIN', { // Adjusted Y position
            fontFamily: 'Courier New',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#8b7e4b',
            padding: { x: 15, y: 10 }
        });
        playAgainButton.setOrigin(0.5);
        playAgainButton.setInteractive({ useHandCursor: true });
        
        // Button click event
        playAgainButton.on('pointerdown', () => {
            this.scene.restart();
        });
        
        // Add main menu button
        const menuButton = this.add.text(400, 430, 'MAIN MENU', { // Adjusted Y position
            fontFamily: 'Courier New',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#8b7e4b',
            padding: { x: 15, y: 10 }
        });
        menuButton.setOrigin(0.5);
        menuButton.setInteractive({ useHandCursor: true });
        
        // Button click event
        menuButton.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    }
}