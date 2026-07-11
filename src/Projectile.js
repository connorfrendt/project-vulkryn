import Phaser from 'phaser';

export default class Projectile {
    constructor(scene, x, y, angle, config) {
        this.scene = scene;
        this.speed = config.speed;
        this.damage = config.damage;
        this.alive = true;
        
        this.sprite = scene.add.sprite(x, y, config.texture, 0);
        
        this.sprite.play(config.animKey);
        this.sprite.rotation = angle; // point the sprite toward travel direction

        this.dirX = Math.cos(angle);
        this.dirY = Math.sin(angle);

        scene.worldContainer.add(this.sprite);
    }

    update(delta, enemies) {
        if(!this.alive) return;

        this.sprite.x += this.dirX * this.speed * (delta / 1000);
        this.sprite.y += this.dirY * this.speed * (delta / 1000);

        for(const enemy of enemies) {
            if(!enemy.alive) continue;
            const distance = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                enemy.sprite.x, enemy.sprite.y
            );

            if(distance <= 20) {
                enemy.takeDamage(this.damage, this.sprite.x, this.sprite.y);
                this.destroy();
                return;
            }
        }
    }

    destroy() {
        this.alive = false;
        this.sprite.destroy();
    }
}