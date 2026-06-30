import Phaser from 'phaser';
import Player from './Player';

import Item from './items/Item';
import { createItem } from './items/ItemFactory';
import { itemSpawns } from './items/itemSpawns';

import CharacterSheet from './CharacterSheet';
import WorldItem from './items/WorldItem';

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

        // Item Spawns in Overworld
        this.worldItem = itemSpawns.map(spawn => {
            const worldItem = new WorldItem(this, createItem(spawn.key), spawn.x, spawn.y);
            
            worldItem.onPickup((item) => {
                this.characterSheet.equip(item);
            });
            
            return worldItem;
        })

        this.characterSheet = new CharacterSheet(this, this.player);

        // C key to toggle character sheet
        this.input.keyboard.on('keydown-C', () => {
            this.characterSheet.toggle();
        });
    }

    // Movement (so far...)
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