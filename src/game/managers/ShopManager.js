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
        this.shopBg.setStrokeStyle(4, 0x4488ff);

        // Get text config from scene
        this.textConfig = this.scene.textConfig;

        // Shop title
        this.shopTitle = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2 - 160, 'UPGRADE SHOP', {
            ...this.textConfig,
            fontSize: '36px',
            color: '#4488ff'
        }).setOrigin(0.5);

        // Upgrade options
        const upgrades = [
            { name: "Move Speed", stat: "moveSpeed", cost: 15, increment: 5 },
            { name: "Max Health", stat: "maxHealth", cost: 20, increment: 2 },
            { name: "Attack Range", stat: "attackRange", cost: 20, increment: 4 },
            { name: "Attack Speed", stat: "attackSpeed", cost: 25, increment: -3 },
            { name: "Damage", stat: "damage", cost: 30, increment: 1 }
        ];

        let yPos = this.scene.cameras.main.height / 2 - 95;

        // Create buttons for upgrades
        this.upgradeButtons = upgrades.map((upgrade, index) => {
            const button = this.scene.add.rectangle(this.scene.cameras.main.width / 2, yPos + (index * 60),
                500, 50, 0x444444).setInteractive();
            button.setStrokeStyle(2, 0x66aaff);

            const text = this.scene.add.text(this.scene.cameras.main.width / 2 - 230, yPos + (index * 60),
                `${upgrade.name}: ${this.scene.playerManager[upgrade.stat]}`, {
                ...this.textConfig,
                fontSize: '18px',
                color: '#ffffff'
            }).setOrigin(0, 0.5);

            const costText = this.scene.add.text(this.scene.cameras.main.width / 2 + 180, yPos + (index * 60),
                `Cost: ${upgrade.cost}`, {
                ...this.textConfig,
                fontSize: '18px',
                color: '#ffdd44'
            }).setOrigin(0.5);

            button.on('pointerover', () => {
                button.setFillStyle(0x666666);
                text.setColor('#ffffff');
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x444444);
                text.setColor('#ffffff');
            });

            button.on('pointerdown', () => {
                // Check if player has enough money
                if (this.scene.playerManager.money >= upgrade.cost) {
                    // Check for attack speed to prevent it going below 50
                    if (upgrade.stat === "attackSpeed" && 
                        this.scene.playerManager[upgrade.stat] + upgrade.increment < 50) {
                        
                        // Create a message about limit
                        const limitMessage = this.scene.add.text(
                            this.scene.cameras.main.width / 2, 
                            this.scene.cameras.main.height / 2 + 150,
                            "Attack Speed cannot go below 50!", 
                            {
                                ...this.textConfig,
                                fontSize: '20px',
                                color: '#ff6666'
                            }
                        ).setOrigin(0.5);
                        
                        // Remove message after delay
                        this.scene.time.delayedCall(1500, () => {
                            limitMessage.destroy();
                        });
                        
                        return;
                    }
                    
                    // Apply upgrades
                    this.scene.playerManager.money -= upgrade.cost;
                    this.scene.playerManager[upgrade.stat] += upgrade.increment;
                    text.setText(`${upgrade.name}: ${this.scene.playerManager[upgrade.stat]}`);
                    this.scene.moneyText.setText(`Money: ${this.scene.playerManager.money}`);
                }
            });

            return { button, text, costText, upgrade };
        });

        // Enemy stats display
        this.enemyStatsTitle = this.scene.add.text(this.scene.cameras.main.width / 2, yPos + 320, 'ENEMY STATS', {
            ...this.textConfig,
            fontSize: '28px',
            color: '#ff6666'
        }).setOrigin(0.5);

        // Enemy stats text
        this.enemyStatsText = this.scene.add.text(this.scene.cameras.main.width / 2, yPos + 380, '', {
            ...this.textConfig,
            fontSize: '16px',
            color: '#ff9999',
            align: 'center'
        }).setOrigin(0.5);

        // Continue button with improved styling
        this.continueButton = this.scene.add.rectangle(this.scene.cameras.main.width / 2, this.scene.cameras.main.height - 80,
            200, 50, 0x008800).setInteractive();
        this.continueButton.setStrokeStyle(2, 0x00ff00);

        this.continueText = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height - 80,
            'CONTINUE', {
            ...this.textConfig,
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Button hover effect
        this.continueButton.on('pointerover', () => {
            this.continueButton.setFillStyle(0x00aa00);
            this.continueText.setColor('#ffffff');
            this.continueButton.setStrokeStyle(3, 0x00ff00);
        });

        this.continueButton.on('pointerout', () => {
            this.continueButton.setFillStyle(0x008800);
            this.continueText.setColor('#ffffff');
            this.continueButton.setStrokeStyle(2, 0x00ff00);
        });

        this.continueButton.on('pointerdown', () => {
            this.hide();
            this.scene.startRound(); 
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

        // Update enemy stats with better formatting
        this.enemyStatsText.setText(
            `Speed: ${this.scene.enemyManager.baseEnemySpeed} + ${this.scene.enemyManager.enemySpeed - this.scene.enemyManager.baseEnemySpeed}\n` +
            `Attack Speed: ${this.scene.enemyManager.baseEnemyShootInterval} - ${Math.abs(this.scene.enemyManager.enemyShootInterval - this.scene.enemyManager.baseEnemyShootInterval)}\n` +
            `Max Health: ${this.scene.enemyManager.baseMaxHealth} + ${this.scene.enemyManager.maxHealth - this.scene.enemyManager.baseMaxHealth}\n` +
            `Damage: ${this.scene.enemyManager.baseDamage} + ${this.scene.enemyManager.damage - this.scene.enemyManager.baseDamage}`
        );

        // Entrance animation
        this.scene.tweens.add({
            targets: this.shopBg,
            scaleX: { from: 0, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Update player stats
        this.upgradeButtons.forEach(item => {
            item.text.setText(`${item.upgrade.name}: ${this.scene.playerManager[item.upgrade.stat]}`);
        });
    }

    hide() {
        // Exit animation
        this.scene.tweens.add({
            targets: this.shopBg,
            scaleX: { from: 1, to: 0 },
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.shopGroup.setVisible(false);
            }
        });
        
        this.isOpen = false;
    }
}