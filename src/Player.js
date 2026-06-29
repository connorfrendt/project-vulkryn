export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

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
            legs: null,
            feet: null,
            hands: null,
            mainHand: null,
            offHand: null,
            trinket: null,
            relic: null,
        }

        // Active Consumables
        this.consumables = {
            fireResistancePotion: null,
            iceResistancePotion: null,
            shadowResistancePotion: null,
        }

        this.speed = 3;
        this.sprite = scene.add.rectangle(x, y, 32, 32, 0x00ff88);
    }

    get strength() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.strength || 0), 0);
    }

    get agility() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.agility || 0), 0);
    }

    get intellect() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.intellect || 0), 0);
    }

    get armor() {
        return Object.values(this.equipment)
            .filter(item => item !== null)
            .reduce((total, item) => total + (item.armor || 0), 0);
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