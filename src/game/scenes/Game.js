import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x222222);

        this.player = this.add.circle(100, 100, 20, 0x0000ff);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.playerMoveSpeed = 200;
        this.playerAttackRange = 100;
        this.playerHealth = 100;
        this.playerMoveTarget = null;

        this.moveIndicator = this.add.circle(0, 0, 6, 0xffff00);
        this.moveIndicator.setVisible(false);

        this.rangeIndicator = this.add.circle(this.player.x, this.player.y, this.playerAttackRange, 0xff0000, 0.1);
        this.rangeIndicator.setStrokeStyle(1, 0xff0000);

        this.input.on('pointerdown', (pointer) => {
            this.playerMoveTarget = { x: pointer.x, y: pointer.y };
            this.moveIndicator.setPosition(pointer.x, pointer.y);
            this.moveIndicator.setVisible(true);
        });

        this.enemy = this.add.circle(400, 300, 20, 0xff0000);
        this.physics.add.existing(this.enemy);
        this.enemy.body.setCollideWorldBounds(true);

        this.enemySpeed = 50;
        this.enemyShootInterval = 500;
        this.enemyBulletSpeed = 300;

        this.enemyBullets = this.physics.add.group();

        this.time.addEvent({
            delay: this.enemyShootInterval,
            loop: true,
            callback: this.enemyShootAtPlayer,
            callbackScope: this,
        });

        this.physics.add.overlap(this.enemyBullets, this.player, this.handlePlayerHit, null, this);
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
                this.playerMoveTarget = null;
                this.moveIndicator.setVisible(false);
            }
            else {
                const angle = Math.atan2(dy, dx);
                body.setVelocity(
                    Math.cos(angle) * this.playerMoveSpeed,
                    Math.sin(angle) * this.playerMoveSpeed
                );
            }
        }

        // Set attack range indicator to player pos
        this.rangeIndicator.setPosition(this.player.x, this.player.y);

        // Move enemy
        const dx = this.player.x - this.enemy.x;
        const dy = this.player.y - this.enemy.y;
        const angle = Math.atan2(dy, dx);
        this.enemy.body.setVelocity(
            Math.cos(angle) * this.enemySpeed,
            Math.sin(angle) * this.enemySpeed
        );
    }

    enemyShootAtPlayer() {
        const bullet = this.add.circle(this.enemy.x, this.enemy.y, 5, 0xffaa00);
        this.enemyBullets.add(bullet);
        bullet.body.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;

        this.physics.world.on('worldbounds', (body) => {
            body.gameObject.destroy();
        });

        const dx = this.player.x - bullet.x;
        const dy = this.player.y - bullet.y;
        const angle = Math.atan2(dy, dx);
        bullet.body.setVelocity(
            Math.cos(angle) * this.enemyBulletSpeed,
            Math.sin(angle) * this.enemyBulletSpeed
        );
    }

    handlePlayerHit(player, bullet) {
        bullet.destroy();
        this.playerHealth -= 10;
        console.log(`Player hit! Health: ${this.playerHealth}`);
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver');
        }
    }
}