import Phaser from 'phaser';
import Player from './Player';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {

    }

    create() {
        this.player = new Player(this, 400, 300);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
    }

    update() {
        if(this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.sprite.x -= this.player.speed;
        }

        if(this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.sprite.x += this.player.speed;
        }

        if(this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.sprite.y -= this.player.speed;
        }

        if(this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.sprite.y += this.player.speed;
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