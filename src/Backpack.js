export default class Backpack {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.visible = false;
        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);
        scene.events.once('create', () => this.build());
    }

    build() {
        const bg = this.scene.add.rectangle(675, 410, 200, 300, 0x111122);
        bg.setStrokeStyle(2, 0x8888ff);
        this.container.add(bg);

        const title = this.scene.add.text(630, 280, 'Backpack', {
            fontSize: '18px',
            fill: '#ffffff',
        });
        this.container.add(title);

        this.slotBoxes = [];

        for(let i = 0; i < this.player.inventoryMax; i++) {
            const col = i % 2;
            const row = Math.floor(i/2);

            const x = 610 + col * 50;
            const y = 325 + row * 50;

            const box = this.scene.add.rectangle(x, y, 40, 40, 0x222223);
            box.setStrokeStyle(1, 0x8888ff);
            box.setInteractive();

            const itemText = this.scene.add.text(x - 18, y - 8, '', {
                fontSize: '11px',
                fill: '#ffaa00',
            });

            box.on('pointerdown', (pointer) => {
                if(!pointer.rightButtonDown()) {
                    return;
                }
                else {
                    const item = this.player.inventory[i];
                    if(item) {
                        this.player.removeFromInventory(item);
                        this.player.equipment[item.slot] = item;
                        this.refresh();
    
                        if(this.onEquip) {
                            this.onEquip();
                        }
                    }
                }
                
            });

            this.container.add([
                box,
                itemText
            ]);

            this.slotBoxes.push({
                box,
                itemText
            });
        }
    }

    refresh() {
        this.slotBoxes.forEach(({ box, itemText }, index) => {
            const item = this.player.inventory[index];
            if(item) {
                itemText.setText(item.name);
                box.setFillStyle(0x223322);
            }
            else {
                itemText.setText('');
                box.setFillStyle(0x222223);
            }
        })
    }

    toggle() {
        this.visible = !this.visible;
        this.container.setVisible(this.visible);
        if(this.visible) {
            this.refresh();
        }
    }
}