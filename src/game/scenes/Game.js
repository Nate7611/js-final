import Phaser, { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x222222);

        this.player = this.add.circle(100, 100, 20, 0x0000ff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.playerMoveSpeed = 400;
        this.playerAttackRange = 200;
        this.playerHealth = 100;
        this.attackSpeed = 500; // milliseconds

        this.playerMoveTarget = null;
        this.isAttacking = false;
        this.altMove = false;

        this.moveIndicator = this.add.circle(0, 0, 6, 0xffff00);
        this.moveIndicator.setVisible(false);

        this.rangeIndicator = this.add.circle(this.player.x, this.player.y, this.playerAttackRange, 0xff0000, 0.1);
        this.rangeIndicator.setStrokeStyle(1, 0xff0000);

        this.input.on('pointerdown', (pointer) => {
            this.altMove = false;
            this.playerMoveTarget = { x: pointer.x, y: pointer.y };
            this.moveIndicator.setPosition(pointer.x, pointer.y);
            this.moveIndicator.setVisible(true);
            this.stopAutoAttack();
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.altMove = true;
            const pointer = this.input.activePointer;
            console.log(pointer.x)
            this.playerMoveTarget = { x: pointer.x, y: pointer.y };
            this.moveIndicator.setPosition(pointer.x, pointer.y);
            this.moveIndicator.setVisible(true);
            this.stopAutoAttack();
        });

        this.enemies = this.physics.add.group();

        this.enemySpeed = 10;
        this.enemyShootInterval = 5000;
        this.enemyBulletSpeed = 300;

        const enemy1 = this.add.circle(400, 300, 20, 0xff0000);
        this.enemies.add(enemy1);
        enemy1.body.setCollideWorldBounds(true);

        this.time.addEvent({
            delay: this.enemyShootInterval,
            loop: true,
            callback: () => this.enemyShootAtPlayer(enemy1),
        });

        enemy1.body.setCollideWorldBounds(true);

        this.enemyBullets = this.physics.add.group();
        this.playerBullets = this.physics.add.group();

        this.physics.add.overlap(this.enemyBullets, this.player, this.handlePlayerHit, null, this);
        this.physics.add.overlap(this.playerBullets, this.enemies, this.handleEnemyHit, null, this);
    }

    // eslint-disable-next-line no-unused-vars
    update(time, delta) {
        // Player Movement
        if (this.playerMoveTarget) {
            const player = this.player;
            const body = player.body;
            const dx = this.playerMoveTarget.x - player.x;
            const dy = this.playerMoveTarget.y - player.y;
            const dist = Math.hypot(dx, dy);

            if (dist < this.playerMoveSpeed * (1 / 60)) {
                body.setVelocity(0, 0);
                this.moveIndicator.setVisible(false);
                this.startAutoAttack();
                this.playerMoveTarget = null;
            }
            else {
                const angle = Math.atan2(dy, dx);
                body.setVelocity(
                    Math.cos(angle) * this.playerMoveSpeed,
                    Math.sin(angle) * this.playerMoveSpeed
                );
            }

            // Check if any enemy comes into attack range
            this.enemies.getChildren().forEach(enemy => {
                const distToEnemy = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
                if (distToEnemy <= this.playerAttackRange && this.altMove) {
                    body.setVelocity(0, 0);
                    this.moveIndicator.setVisible(false);
                    this.startAutoAttack();
                    this.playerMoveTarget = null;
                }
            });
        }

        // Update attack range indicator
        this.rangeIndicator.setPosition(this.player.x, this.player.y);

        // Move enemy
        this.enemies.getChildren().forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const angle = Math.atan2(dy, dx);
            enemy.body.setVelocity(
                Math.cos(angle) * this.enemySpeed,
                Math.sin(angle) * this.enemySpeed
            );
        });

        // Update homing bullets
        this.playerBullets.getChildren().forEach(bullet => {
            if (!bullet.target || !bullet.target.active) return;

            const dx = bullet.target.x - bullet.x;
            const dy = bullet.target.y - bullet.y;
            const angle = Math.atan2(dy, dx);
            const speed = 400;
            bullet.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        });
    }

    startAutoAttack() {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.attackTimer = this.time.addEvent({
            delay: this.attackSpeed,
            loop: true,
            callback: this.playerShoot,
            callbackScope: this
        });
    }

    stopAutoAttack() {
        if (!this.isAttacking) return;
        this.isAttacking = false;
        if (this.attackTimer) this.attackTimer.remove(false);
    }

    playerShoot() {
        let closestEnemy = null;
        let closestDistance = this.playerAttackRange;

        this.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            if (dist <= closestDistance) {
                closestDistance = dist;
                closestEnemy = enemy;
            }
        });

        if (closestEnemy) {
            const bullet = this.add.circle(this.player.x, this.player.y, 5, 0x00ff00);
            this.physics.add.existing(bullet);
            this.playerBullets.add(bullet);
            bullet.body.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;

            this.physics.world.on('worldbounds', (body) => {
                if (body.gameObject === bullet) {
                    bullet.destroy();
                }
            });

            bullet.target = closestEnemy;
        }
    }

    enemyShootAtPlayer(enemy) {
        if (!enemy.active) return;

        const bullet = this.add.circle(enemy.x, enemy.y, 5, 0xffaa00);
        this.physics.add.existing(bullet);
        this.enemyBullets.add(bullet);
        bullet.body.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;

        const dx = this.player.x - bullet.x;
        const dy = this.player.y - bullet.y;
        const angle = Math.atan2(dy, dx);
        bullet.body.setVelocity(
            Math.cos(angle) * this.enemyBulletSpeed,
            Math.sin(angle) * this.enemyBulletSpeed
        );

        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === bullet) {
                bullet.destroy();
            }
        });
    }

    handlePlayerHit(player, bullet) {
        bullet.destroy();
        this.playerHealth -= 10;
        console.log(`Player hit! Health: ${this.playerHealth}`);
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver');
        }
    }

    handleEnemyHit(bullet, enemy) {
        bullet.destroy();
        console.log(enemy)
    }
}