const slotLayout = [
    { slotName: 'head', label: 'Helm', x: 40, y: 100 },
    { slotName: 'shoulders', label: 'Shoulder', x: 40, y: 150 }
]

export default class CharacterSheet {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.visible = false;
        this.container = scene.add.container(0, 0);
        this.container.setScrollFactor(0);
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

        // Add everything to the container
        this.container.add([
            bg, // ALWAYS FIRST
            title,
            this.strengthText,
            this.armorText,
        ]);

        /*
        ========================================================================
        ||                             GEAR SLOTS                             ||
        ========================================================================
        */

        this.slots = {}
        
        slotLayout.forEach(({ slotName, label, x, y }) => {
            const labelText = this.scene.add.text(x + 25, y - 10, label, { fontSize: '14px', fill: '#aaaaaa' });
            const box = this.scene.add.rectangle(x, y, 40, 40, 0x222223);
            
            box.setStrokeStyle(1, 0x8888ff);
            box.setInteractive();
            const statusText = this.scene.add.text(x - 25, y + 20, 'Empty', { fontSize: '11px', fill: '#666666' });

            box.on('pointerdown', () => {
                if(this.player.equipment[slotName]) this.unequip(slotName);
            });

            // Add to container
            this.container.add([
                labelText,
                box,
                statusText
            ]);

            this.slots[slotName] = { box, statusText };
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
        Object.entries(this.slots).forEach(([slotName, { box, statusText }]) => {
            const isEquipped = this.player.equipment[slotName] !== null;
            statusText.setText(isEquipped ? 'Equipped' : 'Empty');
            statusText.setStyle({ fill: isEquipped ? '#00ff88' : '#666666' });
            box.setFillStyle(isEquipped ? 0x223322 : 0x222233);
        });

        this.strengthText.setText(`Strength: ${this.player.strength}`);
        this.armorText.setText(`Armor: ${this.player.armor}`);
    }
    
    toggle() {
        this.visible = !this.visible;
        this.container.setVisible(this.visible);
        if(this.visible) {
            this.refresh();
        }
    }
}