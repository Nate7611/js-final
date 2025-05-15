import Phaser from 'phaser';

export class ProjectileManager {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        this.enemyBullets = this.scene.physics.add.group();
        this.playerBullets = this.scene.physics.add.group();

        this.enemyBulletSpeed = 300;
        this.playerBulletSpeed = 500;
    }

    // eslint-disable-next-line no-unused-vars
    update(time, delta) {
        // Home all player bullets to target
        this.playerBullets.getChildren().forEach(bullet => {
            if (!bullet.target || !bullet.target.active) {return;}

            const dx = bullet.target.x - bullet.x;
            const dy = bullet.target.y - bullet.y;
            const angle = Math.atan2(dy, dx);

            bullet.body.setVelocity(Math.cos(angle) * this.playerBulletSpeed, Math.sin(angle) * this.playerBulletSpeed);
        });
    }

    playerShoot() {
        const playerManager = this.scene.playerManager;
        let closestEnemy = null;
        let closestDistance = playerManager.attackRange;

        // Find closest enemy
        this.scene.enemyManager.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(
                playerManager.player.x, playerManager.player.y,
                enemy.x, enemy.y
            );

            if (dist <= closestDistance) {
                closestDistance = dist;
                closestEnemy = enemy;
            }
        });

        // Once we find closest enemy, create bullet
        if (closestEnemy) {
            const bullet = this.scene.add.circle(
                playerManager.player.x,
                playerManager.player.y,
                5,
                0x00ff00
            );

            this.scene.physics.add.existing(bullet);
            this.playerBullets.add(bullet);
            bullet.body.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            bullet.target = closestEnemy;

            // Remove bullet if it collides with world bounds
            this.scene.physics.world.on('worldbounds', (body) => {
                if (body.gameObject === bullet) {
                    bullet.destroy();
                }
            });
        }
    }

    enemyShootAtPlayer(enemy) {
        if (!enemy.active) {return;}

        const playerManager = this.scene.playerManager;

        // Create bullet
        const bullet = this.scene.add.circle(enemy.x, enemy.y, 5, 0xffaa00);
        this.scene.physics.add.existing(bullet);
        this.enemyBullets.add(bullet);
        bullet.body.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;


        // Shoot towards player
        const dx = playerManager.player.x - bullet.x;
        const dy = playerManager.player.y - bullet.y;
        const angle = Math.atan2(dy, dx);

        bullet.body.setVelocity(Math.cos(angle) * this.enemyBulletSpeed, Math.sin(angle) * this.enemyBulletSpeed);

        // Remove bullet if it collides with world bounds
        this.scene.physics.world.on('worldbounds', (body) => {
            if (body.gameObject === bullet) {
                bullet.destroy();
            }
        });
    }

    // Deal damage when bullet hits
    handlePlayerHit(player, bullet) {
        bullet.destroy();
        this.scene.playerManager.damagePlayer(this.scene.enemyManager.damage);
    }

    handleEnemyHit(bullet, enemy) {
        bullet.destroy();
        this.scene.enemyManager.damageEnemy(enemy, this.scene.playerManager.damage);
    }
}