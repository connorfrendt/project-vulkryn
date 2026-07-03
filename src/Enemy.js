import Phaser from "phaser";

export default class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.hp = config.hp;
        this.maxHp = config.maxHp;
        this.name = config.name;
        this.lootTable = config.lootTable;
        this.alive = true;
        this.attackCooldown = 0;
        this.attackInterval = 3000; // ms between attacks (3s)
        this.attackDamage = config.attackDamage || 10;

        // Visual
        this.sprite = scene.add.sprite(x, y, 'enemy', 0);
        // this.sprite = scene.add.rectangle(x, y, 32, 32, 0xff4444);
        // this.sprite.setStrokeStyle(2, 0xffffff);

        // HP bar background
        this.hpBarBg = scene.add.rectangle(x, y - 28, 40, 6, 0x440000);

        // HP bar fill
        this.hpBar = scene.add.rectangle(x - 20, y - 28, 40, 6, 0xff0000);
        this.hpBar.setOrigin(0, 0.5);

        // Name text
        this.nameText = scene.add.text(x, y - 40, this.name, {
            fontSize: '11px',
            fill: '#ffffff',
        });
    }

    moveTowardPlayer(player) {
        if(!this.alive) return;

        const dx = player.sprite.x - this.sprite.x;
        const dy = player.sprite.y - this.sprite.y;
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        const chaseRange = 300; // How far away the orc "notices" the player
        const stopRange = 60; // Don't walk into melee range, just stand there
        const speed = 40; // Pixels per second, tweak if needed

        if(distance < chaseRange && distance > stopRange) {
            const angle = Math.atan2(dy, dx);
            this.sprite.x += Math.cos(angle) * speed * (this.scene.game.loop.delta / 1000);
            this.sprite.y += Math.sin(angle) * speed * (this.scene.game.loop.delta / 1000);
        }
    }

    tryAttack(player, delta) {
        if(!this.alive) return;

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        if(distance <= 60) {
            this.attackCooldown -= delta;
            if(this.attackCooldown <= 0) {
                player.takeDamage(this.attackDamage);
                this.attackCooldown = this.attackInterval;
            }
        }
        else {
            this.attackCooldown = 0;
        }
    }

    takeDamage(amount) {
        if(!this.alive) {
            return;
        }
        this.hp -= amount;
        this.updateHpBar();

        if(this.hp <= 0) {
            this.die();
        }
    }

    updateHpBar() {
        const pct = Math.max(this.hp, 0) / this.maxHp;
        this.hpBar.scaleX = pct;
    }

    generateLoot() {
        const loot = [];

        // Always add guaranteed drops
        this.lootTable.guaranteed.forEach(itemId => {
            loot.push(itemId);
        });

        // Roll for chance drops
        this.lootTable.chance.forEach(({ itemId, chance }) => {
            if(Math.random() < chance) {
                loot.push(itemId);
            }
        });

        return loot;
    }

    die() {
        this.alive = false;
        this.looted = false;
        this.sprite.setTexture('enemy-dead', 3);
        this.nameText.setText(`${this.name } (Dead)`) // placeholder for now
        this.hpBar.setVisible(false);

        // Make corpse right-clickable
        this.sprite.setInteractive()
        this.sprite.on('pointerdown', (pointer) => {
            if(pointer.rightButtonDown()) {
                if(this.looted) {
                    return;
                }
                const loot = this.generateLoot();
                if(this.onLoot) {
                    this.onLoot(loot);
                }
            }
        })
    }

    syncVisuals() {
        this.hpBarBg.x = this.sprite.x;
        this.hpBarBg.y = this.sprite.y - 28;
        this.hpBar.x = this.sprite.x - 20;
        this.hpBar.y = this.sprite.y - 28;
        this.nameText.x = this.sprite.x - this.nameText.width / 2;
        this.nameText.y = this.sprite.y - 40;
    }


    destroy() {
        this.sprite.destroy();
        this.hpBar.destroy();
        this.hpBarBg.destroy();
        this.nameText.destroy();
    }
}