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

import Projectile from './Projectile.js';
import { projectileData } from './projectiles/projectileData.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.spritesheet('player-idle', '/assets/Sprites/character-sprites/Mage/mage-down-idle.png', {
            frameWidth: 96,
            frameHeight: 96,
        });
        this.load.spritesheet('player-walk', '/assets/Sprites/character-sprites/Mage/mage-walk-down.png', {
            frameWidth: 96,
            frameHeight: 96,
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
        this.load.spritesheet('fireball', '/assets/Sprites/projectiles/fireball.png', {
            frameWidth: 24,
            frameHeight: 24,
        });
        this.load.image('tiles', '/assets/tilemaps/tiles.png');
        this.load.tilemapTiledJSON('test-room', '/assets/tilemaps/test-room-1.json');
    }

    create() {
        this.map = this.make.tilemap({ key: 'test-room' });
        const tileset = this.map.addTilesetImage('tiles', 'tiles');
        const groundLayer = this.map.createLayer('Tile Layer 1', tileset, 0, 0);

        this.worldContainer = this.add.container(0, 0);
        this.worldContainer.add(groundLayer);

        this.input.mouse.disableContextMenu();
        this.player = new Player(this, 700, 300);

        // Main camera - follows player
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.5);

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
        this.dashCooldown = 0;
        this.dashCooldownDuration = 250;

        // Item Spawns in Overworld
        this.worldItem = itemSpawns.map(spawn => {
            const worldItem = new WorldItem(this, createItem(spawn.itemId), spawn.x, spawn.y);

            worldItem.onPickup((item) => {
                this.player.addToInventory(item);
                this.backpack.refresh();
            });
            
            return worldItem;
        });

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
        this.attackRequested = false;
        this.attackCooldown = 0;
        this.attackCooldownDuration = 500; // ms

        this.input.on('pointerdown', (pointer) => {
            if(pointer.leftButtonDown()) {
                this.attackRequested = true;
            }
        })

        this.lootWindow = new LootWindow(this, this.player);

        this.lootWindow.onItemTaken = () => {
            this.backpack.refresh();
        }

        this.enemies = [];
        this.projectiles = [];

        this.anims.create({ key: 'player-idle',    frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }), frameRate: 2, repeat: -1 });
        this.anims.create({ key: 'player-walk',    frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'player-attack',  frames: this.anims.generateFrameNumbers('player-attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'player-dead',    frames: this.anims.generateFrameNumbers('player-dead', {start: 0, end: 3 }), frameRate: 12, repeat: 0 })
        this.anims.create({ key: 'enemy-idle',     frames: this.anims.generateFrameNumbers('enemy-idle', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'enemy-walk',     frames: this.anims.generateFrameNumbers('enemy-walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'enemy-attack',   frames: this.anims.generateFrameNumbers('enemy-attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'enemy-dead',     frames: this.anims.generateFrameNumbers('enemy-dead', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'fireball-fly',   frames: this.anims.generateFrameNumbers('fireball', { start: 0, end: 3 }), frameRate: 12, repeat: -1 });
        this.player.sprite.play('player-idle');

        this.player.sprite.on('animationcomplete-player-attack', () => {
            if(this.player.alive) {
                this.player.sprite.play('player-idle', true);
            }
        });

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
                    { itemId: 'shoulderPad', chance: 1.0 }
                ],
            }
        });

        this.input.on('pointerdown', (pointer) => {
            const backpackBounds = this.backpack.container.getBounds();
            const characterSheetBounds = this.characterSheet.container.getBounds();
            const lootWindowBounds = this.lootWindow.container.getBounds();

            if(pointer.rightButtonDown()) {
                // Potentialy make this data driven instead of copy pasted
                if((Phaser.Geom.Rectangle.Contains(backpackBounds, pointer.x, pointer.y) && this.backpack.visible) ||
                    (Phaser.Geom.Rectangle.Contains(characterSheetBounds, pointer.x, pointer.y) && this.characterSheet.visible) ||
                    (Phaser.Geom.Rectangle.Contains(lootWindowBounds, pointer.x, pointer.y) && this.lootWindow.visible)) {
                    return; // If pointer is over backpack/character sheet/loot window, don't fire projectile
                }

                const angle = Phaser.Math.Angle.Between(
                    this.player.sprite.x, this.player.sprite.y,
                    pointer.worldX, pointer.worldY
                );
                const fireball = new Projectile(this, this.player.sprite.x, this.player.sprite.y, angle, projectileData.fireball);
                this.projectiles.push(fireball);
            }
        });

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
        this.uiCamera.setScroll(0, 0);
        this.uiCamera.setZoom(1);

        this.cameras.main.ignore([this.characterSheet.container, this.backpack.container, this.lootWindow.container]);
        this.uiCamera.ignore(this.worldContainer);
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
                    chance: [{ itemId: 'shoulderPad', chance: 1.0 }],
                }
            }
        );
    }

    update() {
        // TODO: FOR USE LATER
        // this.cameras.main.shake(200, 0.01); // duration ms, intensity
        // this.cameras.main.flash(200, 255, 0, 0); // red flash, e.g. on player hit
        // this.cameras.main.fade(500, 0, 0, 0); // fade to black, e.g. on death/respawn

        // Player Health Bar
        this.player.hpBarBg.x = this.player.sprite.x;
        this.player.hpBarBg.y = this.player.sprite.y - 28;
        this.player.hpBar.x = this.player.sprite.x - 20;
        this.player.hpBar.y = this.player.sprite.y - 28;
        this.player.updateFlicker(this.game.loop.delta);

        // Enemy Visuals
        this.enemies.forEach(enemy => enemy.syncVisuals());

        // Alive Check / Death sequence - freeze everything, respawn after 1s
        if(!this.player.alive) {
            this.playerDeathTimer -= this.game.loop.delta;
            if(this.playerDeathTimer <= 0) {
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
    
            // Close loot window on movement
            if((dirX !== 0 || dirY !== 0) && this.lootWindow.visible) {
                console.log('closed loot window on movement');
                this.lootWindow.close();
            }

            // Dash Start
            if(Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.dashActive && this.dashCooldown <=0 && (dirX != 0 || dirY !== 0)) {
                this.dashActive = true;
                this.dashTimer = 150; // how long the dash is
                this.dashDirX = dirX;
                this.dashDirY = dirY;
                this.player.speed = 8;
                this.player.invulnerable = true;
            }
    
            // Dash Tick
            if(this.dashActive) {
                this.dashTimer -= this.game.loop.delta;
                if(this.dashTimer <= 0) {
                    this.dashActive = false;
                    this.player.speed = 2;
                    this.player.invulnerable = false;
                    this.dashCooldown = this.dashCooldownDuration;
                }
            }

            // Dash Cooldown Tick
            if(this.dashCooldown > 0) {
                this.dashCooldown -= this.game.loop.delta;
            }
    
            // Movement
            const moveX = this.dashActive ? this.dashDirX : dirX;
            const moveY = this.dashActive ? this.dashDirY : dirY;
            this.player.sprite.x += moveX * this.player.speed;
            this.player.sprite.y += moveY * this.player.speed;

            this.player.sprite.x = Phaser.Math.Clamp(this.player.sprite.x, 0, this.map.widthInPixels);
            this.player.sprite.y = Phaser.Math.Clamp(this.player.sprite.y, 0, this.map.heightInPixels);
    
            if(this.player.sprite.anims.getName() !== 'player-attack') {
                if(moveX !==0 || moveY !== 0) {
                    this.player.sprite.play('player-walk', true);
                }
                else {
                    this.player.sprite.play('player-idle', true);
                }
            }
    
            // Attack Cooldown Tick
            if(this.attackCooldown > 0) {
                this.attackCooldown -= this.game.loop.delta;
            }

            // Attack
            if(this.attackRequested && this.attackCooldown <= 0) {
                this.player.sprite.play('player-attack', false);

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
                        target.takeDamage(10, this.player.sprite.x, this.player.sprite.y);
                    }
                }

                this.attackCooldown = this.attackCooldownDuration;
            }

            this.attackRequested = false; // Consume the click either way, so a click during cooldown doesn't queue up
            
            // if player click is not on backpack or character sheet, fire projectile
            this.projectiles.forEach(projectile => projectile.update(this.game.loop.delta, this.enemies));
            this.projectiles = this.projectiles.filter(projectile => projectile.alive);
            
        }

        // Enemy AI
        this.enemies.forEach(enemy => {
            enemy.updateKnockback(this.game.loop.delta);
            enemy.moveTowardPlayer(this.player);
            enemy.tryAttack(this.player, this.game.loop.delta);
        });

    }
}

const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 800,
    pixelArt: true,
    backgroundColor: '#1a1a2e',
    scene: GameScene,
}

const game = new Phaser.Game(config);