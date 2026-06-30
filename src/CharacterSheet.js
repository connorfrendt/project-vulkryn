export default class CharacterSheet {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.visible = false;
        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);
        scene.events.once('create', () => this.build());
    }

    build() {
        // BG panel
        const bg = this.scene.add.rectangle(160, 210, 300, 400, 0x111122);
        bg.setStrokeStyle(2, 0x8888ff);

        // Title
        const title = this.scene.add.text(105, 20, 'Character', {
            fontSize: '18px',
            fill: '#ffffff',
        });

        // STR stat text
        this.strengthText = this.scene.add.text(105, 300, 'Strength: 0', {
            fontSize: '14px',
            fill: '#00ff88',
        });

        // Armor stat text
        this.armorText = this.scene.add.text(105, 320, 'Armor: 0', {
            fontSize: '14px',
            fill: '#00ff88',
        });

        // Shoulder slot label
        const slotLabel = this.scene.add.text(65, 145, 'Shoulders', {
            fontSize: '14px',
            fill: '#aaaaaa',
        });

        // Shoulder slot box
        this.shoulderSlot = this.scene.add.rectangle(40, 150, 40, 40, 0x222223);
        this.shoulderSlot.setStrokeStyle(1, 0x8888ff);
        this.shoulderSlot.setInteractive();

        // Slot status text
        this.slotText = this.scene.add.text(15, 170, 'Empty', {
            fontSize: '11px',
            fill: '#666666',
        });

        // Add everything to the container
        this.container.add([
            bg,
            title,
            this.strengthText,
            this.armorText,
            slotLabel,
            this.shoulderSlot,
            this.slotText,
        ]);

        // Click shoulder slot to toggle equip
        this.shoulderSlot.on('pointerdown', () => {
            if(this.player.equipment.shoulders) {
                this.unequip('shoulders');
            }
            else {
                this.equip(this.scene.shoulderPad);
            }
        });

    }

    equip(item) {
        this.player.equipment[item.slot] = item;
        this.refresh();
    }

    unequip(slot) {
        this.player.equipment[slot] = null;
        this.refresh();
    }

    refresh() {
        console.log('refreshed');
        this.strengthText.setText(`Strength: ${this.player.strength}`);
        this.armorText.setText(`Armor: ${this.player.armor}`);

        const isEquipped = this.player.equipment.shoulders !== null;
        this.slotText.setText(isEquipped ? 'Equipped' : 'Empty');
        this.slotText.setStyle({ fill: isEquipped ? '#00ff88' : '#666666' });
        this.shoulderSlot.setFillStyle(isEquipped ? 0x223322 : 0x222233);
    }
    
    toggle() {
        this.visible = !this.visible;
        this.container.setVisible(this.visible);
        if(this.visible) {
            console.log('HERE');
            this.refresh();
        }
    }
}