export default class Enemy {
    constructor(scene, x, y, config) {
        this.scene = scene;
        this.hp = config.hp;
        this.maxHp = config.maxHp;
        this.name = config.name;
        this.lootTable = config.lootTable;
        this.alive = true;

        // Visual
        this.sprite = scene.add.rectangle(x, y, 32, 32, 0xff4444);
        this.sprite.setStrokeStyle(2, 0xffffff);

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
        this.sprite.setFillStyle(0x444444);
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

    destroy() {
        this.sprite.destroy();
        this.hpBar.destroy();
        this.hpBarBg.destroy();
        this.nameText.destroy();
    }
}