export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.alive = true;
        this.invulnerable = false;
        this.flickerTimer = 0;

        // Core Stats
        this.level = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.gold = 0;
        this.abilities = [];

        // Talent System
        this.talentPoints = 0;
        this.talents = {};

        // Gear Points
        this.gearPoints = {
            total: 0,
            allocated: {
                haste: 0,
                crit: 0,
                mastery: 0,
                vers: 0,
            }
        }

        // Equipment Slots
        this.equipment = {
            head: null,
            chest: null,
            shoulders: null,
            waist: null,
            legs: null,
            feet: null,
            hands: null,
            trinket: null,
            relic: null,
            mainHand: null,
            offHand: null,
        }

        this.inventoryMax = 6;
        this.inventory = [];

        // Active Consumables
        this.consumables = {
            fireResistancePotion: null,
            iceResistancePotion: null,
            shadowResistancePotion: null,
        }

        this.speed = 2;

        // Visual
        this.sprite = scene.add.sprite(x, y, 'player-idle', 0);
        // this.sprite.setScale(2);
        this.hpBarBg = scene.add.rectangle(x, y - 28, 40, 6, 0x440000);
        this.hpBar = scene.add.rectangle(x - 20, y - 28, 40, 6, 0x00ff00);
        this.hpBar.setOrigin(0, 0.5);

        scene.worldContainer.add([this.sprite, this.hpBarBg, this.hpBar]);
    }

    // Stats
    get strength() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.stats?.strength || 0), 0);
    }

    get agility() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.stats?.agility || 0), 0);
    }

    get intellect() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.stats?.intellect || 0), 0);
    }

    takeDamage(amount) {
        if(!this.alive) return;
        if(this.invulnerable) return;
        this.hp -= amount;
        
        if(this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
        this.updateHpBar();
    }

    updateHpBar() {
        const pct = this.hp / this.maxHp;
        this.hpBar.scaleX = pct;
    }

    die() {
        this.alive = false;
        this.sprite.stop();
        this.hpBar.setVisible(false);
        this.hpBarBg.setVisible(false);
        this.sprite.play('player-dead');
        if(this.onDeath) this.onDeath();
    }

    respawn(x, y) {
        this.alive = true;
        this.hp = this.maxHp;
        this.sprite.play('player-idle');
        this.sprite.x = x;
        this.sprite.y = y;
        this.hpBar.setVisible(true);
        this.hpBarBg.setVisible(true);
        this.updateHpBar();
    }

    updateFlicker(delta) {
        if(!this.invulnerable) {
            this.sprite.setAlpha(1); // fully visible when not dashing
            return;
        }

        this.flickerTimer -= delta;
        if(this.flickerTimer <= 0) {
            this.flickerTimer = 50; // flip every 50ms - tweak to taste
            this.sprite.setAlpha(this.sprite.alpha === 1 ? 0.4 : 1);
        }
    }

    // Inventory
    addToInventory(item) {
        if(this.inventory.length >= this.inventoryMax) {
            return false;
        }
        else {
            this.inventory.push(item);
            return true;
        }
    }

    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if(index === -1) {
            return;
        }
        else {
            this.inventory.splice(index, 1);
        }
    }

    // Resistances
    get armor() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.stats?.armor || 0), 0);
    }

    get fireResistance() {
        const gearResist = Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.fireResistance || 0), 0);
        const potionResist = this.consumables.fireResistancePotion?.resistance || 0;
        return gearResist + potionResist;
    }

    get frostResistance() {
        const gearResist = Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.frostResistance || 0), 0);
        const potionResist = this.consumables.frostResistancePotion?.resistance || 0;
        return gearResist + potionResist;
    }

    get shadowResistance() {
        const gearResist = Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.shadowResistance || 0), 0);
        const potionResist = this.consumables.shadowResistancePotion?.resistance || 0;
        return gearResist + potionResist;
    }

    // Gear Points Helpers
    get allocatedPoints() {
        return Object.values(this.gearPoints.allocated)
            .reduce((total, val) => total + val, 0);
    }

    get remainingPoints() {
        return this.gearPoints.total - this.allocatedPoints;
    }

    allocatePoints(stat) {
        if(this.remainingPoints <= 0) return;
        if(!(stat in this.gearPoints.allocated)) return;
        this.gearPoints.allocated[stat]++;
    }

    levelUp() {
        this.level++;
        this.talentPoints++;
        this.gearPoints.total += 5;
        this.maxHp += 20;
        this.hp = this.maxHp;
    }

}