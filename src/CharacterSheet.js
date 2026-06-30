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

        /*
        ========================================================================
        ||                             GEAR SLOTS                             ||
        ========================================================================
        */

        /* ~~~~~~~~~~~~ HEAD ~~~~~~~~~~~~ */

        // Head slot label
        const headSlotLabel = this.scene.add.text(65, 90, 'Helm', {
            fontSize: '14px',
            fill: '#aaaaaa',
        });

        // Head slot box
        this.headSlot = this.scene.add.rectangle(40, 100, 40, 40, 0x222223);
        this.headSlot.setStrokeStyle(1, 0x8888ff);
        this.headSlot.setInteractive();

        // Slot status text
        this.headSlotText = this.scene.add.text(15, 190, 'Empty', {
            fontSize: '11px',
            fill: '#666666',
        });

        /* ~~~~~~~~~~~~ SHOULDER ~~~~~~~~~~~~ */
        // Shoulder slot label
        const shoulderSlotLabel = this.scene.add.text(65, 145, 'Shoulders', {
            fontSize: '14px',
            fill: '#aaaaaa',
        });

        // Shoulder slot box
        this.shoulderSlot = this.scene.add.rectangle(40, 150, 40, 40, 0x222223);
        this.shoulderSlot.setStrokeStyle(1, 0x8888ff);
        this.shoulderSlot.setInteractive();

        // Slot status text
        this.shoulderSlotText = this.scene.add.text(15, 170, 'Empty', {
            fontSize: '11px',
            fill: '#666666',
        });

        // Add everything to the container
        this.container.add([
            bg,
            title,
            this.strengthText,
            this.armorText,

            headSlotLabel,
            shoulderSlotLabel,

            this.headSlot,
            this.headSlotText,
            
            this.shoulderSlot,
            this.shoulderSlotText,
        ]);

        // Click shoulder slot to toggle unequip
        this.headSlot.on('pointerdown', () => {
            if(this.player.equipment.head) {
                this.unequip('head');
            }
        });

        // Click shoulder slot to toggle unequip
        this.shoulderSlot.on('pointerdown', () => {
            if(this.player.equipment.shoulders) {
                this.unequip('shoulders');
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
        const isHeadEquipped = this.player.equipment.head !== null;
        const isShouldersEquipped = this.player.equipment.shoulders !== null;
        
        this.headSlotText.setText(isHeadEquipped ? 'Equipped' : 'Empty');
        this.headSlotText.setStyle({ fill: isHeadEquipped ? '#00ff88' : '#666666'});
        this.headSlot.setFillStyle(isHeadEquipped ? 0x223322 : 0x222233);

        this.shoulderSlotText.setText(isShouldersEquipped ? 'Equipped' : 'Empty');
        this.shoulderSlotText.setStyle({ fill: isShouldersEquipped ? '#00ff88' : '#666666' });
        this.shoulderSlot.setFillStyle(isShouldersEquipped ? 0x223322 : 0x222233);

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