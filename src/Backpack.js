const PANEL_WIDTH = 200;
const PANEL_HEIGHT = 300;
const MARGIN = 20;

export default class Backpack {
    constructor(scene, player) {
        this.scene = scene;
        this.panelWidth = PANEL_WIDTH;
        this.panelHeight = PANEL_HEIGHT;
        this.player = player;
        this.visible = false;
        this.container = scene.add.container(0, 0);
        this.backpackOpen = false;
        this.container.setVisible(false);
        scene.events.once('create', () => this.build());
    }

    build() {
        const gameWidth = this.scene.sys.game.config.width;
        const gameHeight = this.scene.sys.game.config.height;
        
        this.container.setPosition(
            gameWidth - MARGIN - PANEL_WIDTH,
            gameHeight - MARGIN - PANEL_HEIGHT
        )

        const bg = this.scene.add.rectangle(PANEL_WIDTH / 2, PANEL_HEIGHT / 2, PANEL_WIDTH, PANEL_HEIGHT, 0x111122);
        bg.setStrokeStyle(2, 0x8888ff);
        this.container.add(bg);

        const title = this.scene.add.text(55, 20, 'Backpack', {
            fontSize: '18px',
            fill: '#ffffff',
        });
        this.container.add(title);

        this.slotBoxes = [];

        for(let i = 0; i < this.player.inventoryMax; i++) {
            const col = i % 2;
            const row = Math.floor(i/2);

            const x = 35 + col * 50;
            const y = 65 + row * 50;

            const box = this.scene.add.rectangle(x, y, 40, 40, 0x222223);
            box.setStrokeStyle(1, 0x8888ff);
            // box.setInteractive({ draggable: true });

            const itemIcon = this.scene.add.rectangle(x, y, 32, 32, 0x223322);
            itemIcon.setVisible(false);
            itemIcon.setInteractive({ draggable: true });
            
            const itemText = this.scene.add.text(x - 18, y - 8, '', {
                fontSize: '11px',
                fill: '#ffaa00',
            });

            itemIcon.on('pointerdown', (pointer) => {
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

            itemIcon.on('dragstart', (pointer) => {
                console.log('dragstart', i);
            });

            itemIcon.on('drag', (pointer, dragX, dragY) => {
                itemIcon.x = pointer.x - this.container.x;
                itemIcon.y = pointer.y - this.container.y;
            });

            itemIcon.on('dragend', (pointer) => {
                console.log('dragend', i, this.scene.getUIPanelAt(pointer));
                itemIcon.x = x;
                itemIcon.y = y;
            });

            this.container.add([
                box,
                itemIcon,
                itemText
            ]);

            this.slotBoxes.push({
                box,
                itemIcon,
                itemText
            });
        }
    }

    refresh() {
        this.slotBoxes.forEach(({ itemIcon, itemText }, index) => {
            const item = this.player.inventory[index];
            if(item) {
                itemText.setText(item.name);
                itemIcon.setVisible(true);
            }
            else {
                itemText.setText('');
                itemIcon.setVisible(false);
            }
        });
    }

    toggle() {
        this.visible = !this.visible;
        this.container.setVisible(this.visible);
        if(this.visible) {
            this.refresh();
        }
    }
}