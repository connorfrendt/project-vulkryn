import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {

    }

    create() {
        this.player = this.add.rectangle(400, 300, 32, 32, 0x00ff88);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        })
    }

    update() {
        const speed = 3;

        if(this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.x -= speed;
        }

        if(this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.x += speed;
        }

        if(this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.y -= speed;
        }

        if(this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.y += speed;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
    scene: GameScene,
}



const game = new Phaser.Game(config);