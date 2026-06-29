export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.speed = 3;
        this.sprite = scene.add.rectangle(x, y, 32, 32, 0x00ff88);
    }
}