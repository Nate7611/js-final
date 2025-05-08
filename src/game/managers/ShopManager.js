import Phaser from 'phaser';

export class ShopManager {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.createShopUI();
    }

    createShopUI() {
        this.shopGroup = this.scene.add.group();

        // Background panel
        this.shopBg = this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2,
            600, 400, 0x000000, 0.8);
        this.shopBg.setStrokeStyle(2, 0xffffff);

        // Shop title
        this.shopTitle = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 - 160, 'UPGRADE SHOP', {
            font: 'bold 32px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Upgrade options
        const upgrades = [
            { name: "Max Health", stat: "maxHealth", cost: 10, increment: 10 },
            { name: "Move Speed", stat: "moveSpeed", cost: 15, increment: 20 },
            { name: "Attack Range", stat: "attackRange", cost: 20, increment: 15 },
            { name: "Attack Speed", stat: "attackSpeed", cost: 25, increment: 5 },
            { name: "Damage", stat: "damage", cost: 30, increment: 5 }
        ];

        let yPos = this.scene.cameras.main.height / 2 - 95;

        // Create buttons for upgrades
        this.upgradeButtons = upgrades.map((upgrade, index) => {
            // Button background
            const button = this.scene.add.rectangle(this.scene.cameras.main.width / 2, yPos + (index * 60),
                500, 50, 0x444444).setInteractive();

            // Button text
            const text = this.scene.add.text(this.scene.cameras.main.width / 2 - 230, yPos + (index * 60),
                `${upgrade.name}: ${this.scene.playerManager[upgrade.stat]}`, {
                font: '18px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);

            // Cost text
            const costText = this.scene.add.text(this.scene.cameras.main.width / 2 + 180, yPos + (index * 60),
                `Cost: ${upgrade.cost}`, {
                font: '18px Arial',
                fill: '#ffff00'
            }).setOrigin(0.5);

            // Button hover effect
            button.on('pointerover', () => {
                button.setFillStyle(0x666666);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x444444);
            });

            button.on('pointerdown', () => {
                if (this.scene.playerManager.money >= upgrade.cost) {
                    this.scene.playerManager.money -= upgrade.cost;
                    this.scene.playerManager[upgrade.stat] += upgrade.increment;
                    text.setText(`${upgrade.name}: ${this.scene.playerManager[upgrade.stat]}`);
                    this.scene.moneyText.setText(`money: ${this.scene.playerManager.money}`);

                    // Increase cost for next upgrade lvl
                    upgrade.cost = Math.floor(upgrade.cost * 1.5);
                    costText.setText(`Cost: ${upgrade.cost}`);
                }
            });

            return { button, text, costText, upgrade };
        });

        // Enemy stats display
        this.enemyStatsTitle = this.scene.add.text(this.scene.cameras.main.width / 2, yPos + 320, 'ENEMY STATS', {
            font: 'bold 24px Arial',
            fill: '#ff0000'
        }).setOrigin(0.5);

        // Enemy stats text
        this.enemyStatsText = this.scene.add.text(this.scene.cameras.main.width / 2, yPos + 370, '', {
            font: '16px Arial',
            fill: '#ff9999',
            align: 'center'
        }).setOrigin(0.5);

        // Continue button
        this.continueButton = this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height - 80,
            200, 50, 0x008800).setInteractive();

        this.continueText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height - 80,
            'CONTINUE', {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Button hover effect
        this.continueButton.on('pointerover', () => {
            this.continueButton.setFillStyle(0x00aa00);
        });

        this.continueButton.on('pointerout', () => {
            this.continueButton.setFillStyle(0x008800);
        });

        this.continueButton.on('pointerdown', () => {
            this.hide();
            this.scene.enemyManager.spawnEnemies();
            this.isOpen = false;
            this.scene.shopOpen = false;
        });

        // Add all ui elements to group
        this.shopGroup.add(this.shopBg);
        this.shopGroup.add(this.shopTitle);
        this.upgradeButtons.forEach(item => {
            this.shopGroup.add(item.button);
            this.shopGroup.add(item.text);
            this.shopGroup.add(item.costText);
        });
        this.shopGroup.add(this.enemyStatsTitle);
        this.shopGroup.add(this.enemyStatsText);
        this.shopGroup.add(this.continueButton);
        this.shopGroup.add(this.continueText);

        this.hide();
    }

    show() {
        // Show the shop UI
        this.shopGroup.setVisible(true);
        this.isOpen = true;

        // Update enemy stats
        this.enemyStatsText.setText(
            `Speed: ${this.scene.enemyManager.enemySpeed}\n` +
            `Shoot Interval: ${this.scene.enemyManager.enemyShootInterval}\n` +
            `Max Health: ${this.scene.enemyManager.maxHealth}\n` +
            `Damage: ${this.scene.enemyManager.damage}`
        );

        // Update player stats
        this.upgradeButtons.forEach(item => {
            item.text.setText(`${item.upgrade.name}: ${this.scene.playerManager[item.upgrade.stat]}`);
        });
    }

    hide() {
        this.shopGroup.setVisible(false);
        this.isOpen = false;
    }
}