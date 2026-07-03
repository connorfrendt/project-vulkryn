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
        this.load.spritesheet('player', '/assets/Sprites/character-sprites/Soldier/Soldier/Soldier_Idle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('enemy', '/assets/Sprites/character-sprites/Orc/Orc/Orc_Idle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('enemy-dead', '/assets/Sprites/character-sprites/Orc/Orc/Orc_Death.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
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
        this.attackKey = this.input.keyboard.addKey('ONE');

        this.lootWindow = new LootWindow(this, this.player);

        this.lootWindow.onItemTaken = () => {
            this.backpack.refresh();
        }

        // Spawn Orc enemy
        // this.orc = new Enemy(this, 300, 200, {
        //     name: 'Cave Orc',
        //     hp: 30,
        //     maxHp: 30,
        //     lootTable: {
        //         guaranteed: [
                    
        //         ],
        //         chance: [
        //             { itemId: 'shoulderPad', chance: 1.0 }
        //         ],
        //     }
        // });

        // this.orc.onLoot = (loot) => {
        //     this.lootWindow.open(loot, this.orc);
        // }

        this.enemies = [];

        this.spawnEnemy(300, 200, {
            name: 'Cave Orc',
            hp: 30,
            maxHp: 30,
            lootTable: {
                guaranteed: [],
                chance: [
                    { itemId: 'shoulderPad', chance: 0.5 }
                ],
            }
        });
    }

    spawnEnemy(x, y, config) {
        const enemy = new Enemy(this, x, y, config);
        enemy.onLoot = (loot) => {
            this.lootWindow.open(loot, enemy);
        };
        this.enemies.push(enemy);
        return enemy;
    }

    // Movement (so far...)
    update() {
        // Player Health Bar
        this.player.hpBarBg.x = this.player.sprite.x;
        this.player.hpBarBg.y = this.player.sprite.y - 28;
        this.player.hpBar.x = this.player.sprite.x - 20;
        this.player.hpBar.y = this.player.sprite.y - 28;
        
        // if(this.orc) {
        //     // Enemy Health Bar
        //     this.orc.hpBarBg.x = this.orc.sprite.x;
        //     this.orc.hpBarBg.y = this.orc.sprite.y - 28;
        //     this.orc.hpBar.x = this.orc.sprite.x - 20;
        //     this.orc.hpBar.y = this.orc.sprite.y - 28;

        //     // Enemy Name
        //     this.orc.nameText.x = this.orc.sprite.x - this.orc.nameText.width / 2;
        //     this.orc.nameText.y = this.orc.sprite.y - 40;
        // }

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

        // Enemy Visuals
        this.enemies.forEach(enemy => enemy.syncVisuals());

        // Attack Key
        if(Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            const attackRange = 60;
            const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
            const target = aliveEnemies.sort((a, b) =>
                Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, a.sprite.x, a.sprite.y) -
                Phaser.Math.Distance.Between(this.player.sprite.x, this.player.sprite.y, b.sprite.x, b.sprite.y)

            )[0];

            if(target) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.sprite.x, this.player.sprite.y,
                    target.sprite.x, target.sprite.y
                );

                if(distance <= attackRange) {
                    target.takeDamage(10);
                }
                else {
                    console.log('Enemy out of range');
                }
            }
        }

        // Enemy AI
        this.enemies.forEach(enemy => {
            enemy.moveTowardPlayer(this.player);
            enemy.tryAttack(this.player, this.game.loop.delta);
        });

        // if(Phaser.Input.Keyboard.JustDown(this.attackKey)) {
        //     if(this.orc && this.orc.alive) {
        //         const distance = Phaser.Math.Distance.Between(
        //             this.player.sprite.x, this.player.sprite.y,
        //             this.orc.sprite.x, this.orc.sprite.y
        //         );

        //         const attackRange = 60 // Tweak this to taste

        //         if(distance <= attackRange) {
        //             this.orc.takeDamage(10);
        //         }
        //         else {
        //             console.log('Enemy out of range');
        //         }
        //     }
        // }

        // if(this.orc) {
        //     this.orc.moveTowardPlayer(this.player);
        //     this.orc.tryAttack(this.player, this.game.loop.delta);
        // }


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