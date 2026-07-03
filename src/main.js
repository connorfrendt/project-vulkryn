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
        this.load.spritesheet('player-idle', '/assets/Sprites/character-sprites/Soldier/Soldier/Soldier_Idle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('player-walk', '/assets/Sprites/character-sprites/Soldier/Soldier/Soldier_Walk.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('player-attack', '/assets/Sprites/character-sprites/Soldier/Soldier/Soldier_Attack01.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('player-dead', '/assets/Sprites/character-sprites/Soldier/Soldier/Soldier_Death.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('enemy-idle', '/assets/Sprites/character-sprites/Orc/Orc/Orc_Idle.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('enemy-walk', '/assets/Sprites/character-sprites/Orc/Orc/Orc_Walk.png', {
            frameWidth: 100,
            frameHeight: 100,
        });
        this.load.spritesheet('enemy-attack', '/assets/Sprites/character-sprites/Orc/Orc/Orc_Attack01.png', {
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
        this.player = new Player(this, 700, 300);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dashActive = false;
        this.dashTimer = 0;
        this.dashDirX = 0;
        this.dashDirY = 0;

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

        this.enemies = [];

        this.anims.create({ key: 'player-idle', frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'player-walk', frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player-attack', frames: this.anims.generateFrameNumbers('player-attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'enemy-idle', frames: this.anims.generateFrameNumbers('enemy-idle', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'enemy-walk', frames: this.anims.generateFrameNumbers('enemy-walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'enemy-attack', frames: this.anims.generateFrameNumbers('enemy-attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
        this.player.sprite.play('player-idle');

        this.playerDeathTimer = 0;
        this.player.onDeath = () => {
            this.playerDeathTimer = 2000;
        }

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

    doRespawn() {
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];

        this.player.respawn(50, 300);
        this.player.speed = 2;

        this.spawnEnemy(
            Phaser.Math.Between(300, 700),
            Phaser.Math.Between(100, 500),
            {
                name: 'Cave Orc',
                hp: 30,
                maxHp: 30,
                lootTable: {
                    guaranteed: [],
                    chance: [{ itemId: 'shoulderPad', chance: 0.5 }],
                }
            }
        )
    }

    // Movement
    update() {
        // Player Health Bar
        this.player.hpBarBg.x = this.player.sprite.x;
        this.player.hpBarBg.y = this.player.sprite.y - 28;
        this.player.hpBar.x = this.player.sprite.x - 20;
        this.player.hpBar.y = this.player.sprite.y - 28;

        // Enemy Visuals
        this.enemies.forEach(enemy => enemy.syncVisuals());

        // Alive Check / Death sequence - freeze everything, respawn after 1s
        if(!this.player.alive) {
            this.playerDeathTimer -= this.game.loop.delta;
            if(this.playerDeathTimer <=0) {
                this.doRespawn();
            }
        }

        if(this.player.alive) {

            // Capture movement direction
            let dirX = 0;
            let dirY = 0;
            if(this.cursors.left.isDown || this.wasd.left.isDown) dirX = -1;
            if(this.cursors.right.isDown || this.wasd.right.isDown) dirX = 1;
            if(this.cursors.up.isDown || this.wasd.up.isDown) dirY = -1;
            if(this.cursors.down.isDown || this.wasd.down.isDown) dirY = 1;
    
            // Dash Start
            if(Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.dashActive && (dirX != 0 || dirY !== 0)) {
                this.dashActive = true;
                this.dashTimer = 150;
                this.dashDirX = dirX;
                this.dashDirY = dirY;
                this.player.speed = 8;
            }
    
            // Dash Tick
            if(this.dashActive) {
                this.dashTimer -= this.game.loop.delta;
                if(this.dashTimer <= 0) {
                    this.dashActive = false;
                    this.player.speed = 2;
                }
            }
    
            // Movement
            const moveX = this.dashActive ? this.dashDirX : dirX;
            const moveY = this.dashActive ? this.dashDirY : dirY;
            this.player.sprite.x += moveX * this.player.speed;
            this.player.sprite.y += moveY * this.player.speed;
    
            if(this.player.sprite.anims.getName() !== 'player-attack') {
                if(moveX !==0 || moveY !== 0) {
                    this.player.sprite.play('player-walk', true);
                }
                else {
                    this.player.sprite.play('player-idle', true);
                }
            }
    
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
                        this.player.sprite.play('player-attack', false);
                    }
                    else {
                        console.log('Enemy out of range');
                    }
                }
            }
        }

        // Enemy AI
        this.enemies.forEach(enemy => {
            enemy.moveTowardPlayer(this.player);
            enemy.tryAttack(this.player, this.game.loop.delta);
        });

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