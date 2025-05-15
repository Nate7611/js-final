import Phaser from 'phaser';

export class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.init();
        this.setupInputHandlers();
    }

    init() {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        this.player = this.scene.add.circle(centerX, centerY, 20, 0x0000ff);
        this.scene.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.maxHealth = 100;
        this.moveSpeed = 300;
        this.attackRange = 180;
        this.attackSpeed = 300;
        this.damage = 12;

        this.money = 0;

        this.health = this.maxHealth;
        this.moveTarget = null;
        this.altMove = false;
        this.canAttack = true;
        this.attackTime = 0;

        this.moveIndicator = this.scene.add.circle(0, 0, 6, 0xffff00);
        this.moveIndicator.setVisible(false);

        this.rangeIndicator = this.scene.add.circle(this.player.x, this.player.y, this.attackRange, 0xff0000, 0.1);
        this.rangeIndicator.setStrokeStyle(1, 0xff0000);

        this.createHealthBar();
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(
            this.player.x,
            this.player.y - 30,
            50,
            8,
            0x808080
        );

        this.healthBar = this.scene.add.rectangle(
            this.player.x - 25,
            this.player.y - 30,
            50,
            8,
            0x00ff00
        );
        this.healthBar.setOrigin(0, 0.5);
    }

    setupInputHandlers() {
        this.scene.input.on('pointerdown', (pointer) => {
            this.altMove = false;
            this.moveTarget = { x: pointer.x, y: pointer.y };
            this.moveIndicator.setPosition(pointer.x, pointer.y);
            this.moveIndicator.setVisible(true);
            this.canAttack = false;
        });

        this.scene.input.keyboard.on('keydown-SPACE', () => {
            this.altMove = true;
            const pointer = this.scene.input.activePointer;
            this.moveTarget = { x: pointer.x, y: pointer.y };
            this.moveIndicator.setPosition(pointer.x, pointer.y);
            this.moveIndicator.setVisible(true);
            this.canAttack = false;
        });
    }

    update(time, delta) {
        this.attackTime += delta;

        // Handle movement
        if (this.moveTarget) {
            const dx = this.moveTarget.x - this.player.x;
            const dy = this.moveTarget.y - this.player.y;
            const dist = Math.hypot(dx, dy);

            if (dist < this.moveSpeed * (1 / 60)) {
                this.player.body.setVelocity(0, 0);
                this.moveIndicator.setVisible(false);
                this.moveTarget = null;
                this.canAttack = true;
            } else {
                const angle = Math.atan2(dy, dx);
                this.player.body.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
            }

            // Stop near enemies in alt mode
            if (this.altMove) {
                this.scene.enemyManager.enemies.getChildren().forEach(enemy => {
                    const distToEnemy = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
                    if (distToEnemy <= this.attackRange) {
                        this.player.body.setVelocity(0, 0);
                        this.moveIndicator.setVisible(false);
                        this.moveTarget = null;
                        this.canAttack = true;
                    }
                });
            }
        }

        // Try to shoot
        if (this.canAttack) {
            this.tryShoot();
        }

        // Update indicators
        this.rangeIndicator.setPosition(this.player.x, this.player.y);
        this.rangeIndicator.setRadius(this.attackRange);

        // Update health bar position
        if (this.healthBar && this.healthBarBg) {
            this.healthBarBg.setPosition(this.player.x, this.player.y - 30);
            this.healthBar.setPosition(this.player.x - 25, this.player.y - 30);
        }
    }

    tryShoot() {
        if (this.attackTime >= this.attackSpeed) {
            this.attackTime = 0;
            this.scene.projectileManager.playerShoot();
        }
    }

    damagePlayer(amount) {
        this.health -= amount;

        this.updateHealthBar();

        if (this.health <= 0) {
            this.healthBar?.destroy();
            this.healthBarBg?.destroy();
            this.scene.scene.start('MainMenu');
        }
    }

    updateHealthBar() {
        // Update health bar
        if (this.healthBar) {
            const healthPercentage = Math.max(0, this.health / this.maxHealth);
            this.healthBar.width = 50 * healthPercentage;

            if (healthPercentage < 0.3) {
                this.healthBar.fillColor = 0xff0000;
            } else if (healthPercentage < 0.6) {
                this.healthBar.fillColor = 0xffff00;
            } else {
                this.healthBar.fillColor = 0x00ff00;
            }
        }
    }
}