import { createItem } from "./items/ItemFactory.js";

export default class LootWindow {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.visible = false;
        this.currentLoot = [];
        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);
        scene.events.once('create', () => this.build());
    }

    build() {
        // Background panel
        const bg = this.scene.add.rectangle(300, 300, 200, 250, 0x111122);
        bg.setStrokeStyle(2, 0xffaa00);
        this.container.add(bg);

        // Title
        const lootTitle = this.scene.add.text(210, 185, 'Loot', {
            fontSize: '18px',
            fill: '#ffaa00',
        });
        this.container.add(lootTitle);

        // Loot slot boxes - up to 6 items
        this.lootSlots = [];

        for(let i = 0; i < 5; i++) {
            const x = 230;
            const y = 220 + i * 45;

            const box = this.scene.add.rectangle(x, y, 40, 40, 0x222223);
            box.setStrokeStyle(1, 0xffaa00);
            box.setInteractive();

            const itemText = this.scene.add.text(x + 25, y - 8, '', {
                fontSize: '11px',
                fill: '#ffffff',
            });

            box.on('pointerdown', (pointer) => {
                if(pointer.leftButtonDown()) {
                    this.takeLoot(i)
                }
            });

            this.container.add([box, itemText]);
            this.lootSlots.push({ box, itemText });
        }

        this.closeButton = this.scene.add.text(385, 188, 'X', {
            fontSize: '14px',
            fill: '#ff4444',
        }).setInteractive();

        this.closeButton.on('pointerdown', () => {
            this.close();
        });

        this.container.add(this.closeButton);
    }

    open(lootKeys, enemy) {
        this.currentEnemy = enemy;
        this.currentLoot = [...lootKeys];
        this.refresh();
        this.container.setVisible(true);
        this.visible = true;
    }

    close() {
        const allLooted = this.currentLoot.every(item => item === null);
        
        if(this.currentEnemy) {
            if(allLooted) {
                this.currentEnemy.looted = true;
                this.currentEnemy.sprite.removeInteractive();
            }
            
            this.currentEnemy = null;
        }
        this.container.setVisible(false);
        this.visible = false;
        this.currentLoot = [];
    }

    takeLoot(index) {
        const itemKey = this.currentLoot[index];
        if(!itemKey) {
            return;
        }

        const success = this.player.addToInventory(createItem(itemKey));

        if(success) {
            this.currentLoot[index] = null;
            this.refresh();
            if(this.onItemTaken) {
                this.onItemTaken();
            }
            else {
                console.log('Bags full!');
            }
        }

        // Close if all loot is taken
        if(this.currentLoot.every(item => item === null)) {
            this.close();
        }
    }

    refresh() {
        this.lootSlots.forEach(({ box, itemText }, index) => {
            const itemKey = this.currentLoot[index];
            if(itemKey) {
                itemText.setText(itemKey);
                box.setFillStyle(0x223322);
            }
            else {
                itemText.setText('');
                box.setFillStyle(0x222223);
            }
        })
    }
}