export default class WorldItem {
    constructor(scene, item, x, y, color = 0xffaa00) {
        this.scene = scene;
        this.item = item;
        this.sprite = scene.add.rectangle(x, y, 24, 24, color);
        this.sprite.setStrokeStyle(2, 0xffffff);
        this.sprite.setInteractive();
    }

    onPickup(callback) {
        this.sprite.on('pointerdown', () => {
            callback(this.item);
            this.sprite.setVisible(false);
        });
    }
}