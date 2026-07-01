import Phaser from 'phaser';
import Player from './Player.js';

import Item from './items/Item';
import { createItem } from './items/ItemFactory.js';
import { itemSpawns } from './items/itemSpawns.js';

import CharacterSheet from './CharacterSheet.js';
import WorldItem from './items/WorldItem.js';

import Backpack from './Backpack.js';

import Enemy from './Enemy.js';
import LootWindow from './LootWindow.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {

    }

    create() {
        this.input.mouse.disableContextMenu();
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
            const worldItem = new WorldItem(this, createItem(spawn.itemId), spawn.x, spawn.y);
            
            worldItem.onPickup((item) => {
                this.player.addToInventory(item);
                this.backpack.refresh();
            });
            
            return worldItem;
        })

        this.characterSheet = new CharacterSheet(this, this.player);
        this.backpack = new Backpack(this, this.player);

        // C key to toggle character sheet
        this.input.keyboard.on('keydown-C', () => {
            this.characterSheet.toggle();
        });

        // B key to toggle backpack
        this.input.keyboard.on('keydown-B', () => {
            this.backpack.toggle();
        });
        this.backpack.onEquip = () => {
            this.characterSheet.refresh();
        }

        // Basic Attack
        this.input.keyboard.on('keydown-F', () => {
            if(this.spider && this.spider.alive) {
                this.spider.takeDamage(10);
            }
        })

        this.lootWindow = new LootWindow(this, this.player);

        this.lootWindow.onItemTaken = () => {
            this.backpack.refresh();
        }

        // Spawn spider enemy
        this.spider = new Enemy(this, 300, 200, {
            name: 'Cave Spider',
            hp: 30,
            maxHp: 30,
            lootTable: {
                guaranteed: [
                    
                ],
                chance: [
                    { itemId: 'shoulderPad', chance: 1.0 }
                ],
            }
        });

        this.spider.onLoot = (loot) => {
            this.lootWindow.open(loot, this.spider);
        }
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