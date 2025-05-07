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
        
        this.moveSpeed = 400;
        this.attackRange = 200;
        this.health = 100;
        this.attackSpeed = 50;
        this.damage = 10;
        
        this.moveTarget = null;
        this.altMove = false;
        this.canAttack = true;
        this.attackTime = 0;
        
        this.moveIndicator = this.scene.add.circle(0, 0, 6, 0xffff00);
        this.moveIndicator.setVisible(false);
        
        this.rangeIndicator = this.scene.add.circle(this.player.x, this.player.y, this.attackRange, 0xff0000, 0.1);
        this.rangeIndicator.setStrokeStyle(1, 0xff0000);
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
        
        // Handle player movement
        if (this.moveTarget) {
            const dx = this.moveTarget.x - this.player.x;
            const dy = this.moveTarget.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.moveSpeed * (1 / 60)) {
                // Player reached destination
                this.player.body.setVelocity(0, 0);
                this.moveIndicator.setVisible(false);
                this.moveTarget = null;
                this.canAttack = true;
            } else {
                // Move player towards destination
                const angle = Math.atan2(dy, dx);
                this.player.body.setVelocity(Math.cos(angle) * this.moveSpeed, Math.sin(angle) * this.moveSpeed);
            }
            
            // Check if any enemy comes into attack range during alt movement
            if (this.altMove) {
                this.scene.enemyManager.enemies.getChildren().forEach(enemy => {
                    const distToEnemy = Phaser.Math.Distance.Between(
                        this.player.x, this.player.y, enemy.x, enemy.y
                    );
                    
                    if (distToEnemy <= this.attackRange) {
                        this.player.body.setVelocity(0, 0);
                        this.moveIndicator.setVisible(false);
                        this.moveTarget = null;
                        this.canAttack = true;
                    }
                });
            }
        }
        
        // Try to shoot if player is standing still
        if (this.canAttack) {
            this.tryShoot();
        }
        
        // Update range indicator position to follow player
        this.rangeIndicator.setPosition(this.player.x, this.player.y);
    }
    
    tryShoot() {
        if (this.attackTime >= this.attackSpeed) {
            this.attackTime = 0;
            this.scene.projectileManager.playerShoot();
        }
    }
    
    damagePlayer(amount) {
        this.health -= amount;
        console.log(`Player hit! Health: ${this.health}`);
        
        if (this.health <= 0) {
            this.scene.scene.start('GameOver');
        }
    }
}