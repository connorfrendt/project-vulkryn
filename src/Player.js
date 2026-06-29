export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Core Stats
        this.level = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.gold = 0;
        this.abilities = [];

        // Primary Stats
        this.strength = 1;
        this.agility = 1;
        this.intellect = 1;

        this.speed = 3;
        this.sprite = scene.add.rectangle(x, y, 32, 32, 0x00ff88);
    }
}