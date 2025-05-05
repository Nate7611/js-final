import Phaser from 'phaser';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.init();
        this.createEnemies();
    }

    init() {
        this.enemies = this.scene.physics.add.group();

        this.enemySpeed = 10;
        this.enemyShootInterval = 5000;
    }

    createEnemies() {
        const enemy1 = this.scene.add.circle(400, 300, 20, 0xff0000);
        this.enemies.add(enemy1);
        enemy1.body.setCollideWorldBounds(true);

        this.scene.time.addEvent({
            delay: this.enemyShootInterval,
            loop: true,
            callback: () => this.scene.projectileManager.enemyShootAtPlayer(enemy1),
        });

        const enemy2 = this.scene.add.circle(800, 200, 20, 0xff0000);
        this.enemies.add(enemy2);
        enemy2.body.setCollideWorldBounds(true);

        this.scene.time.addEvent({
            delay: this.enemyShootInterval,
            loop: true,
            callback: () => this.scene.projectileManager.enemyShootAtPlayer(enemy2),
        });
    }

    update(time, delta) {
        // Move enemies towards player
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;

            const dx = this.scene.playerManager.player.x - enemy.x;
            const dy = this.scene.playerManager.player.y - enemy.y;
            const angle = Math.atan2(dy, dx);

            enemy.body.setVelocity(
                Math.cos(angle) * this.enemySpeed,
                Math.sin(angle) * this.enemySpeed
            );
        });
    }

    damageEnemy(enemy) {
        console.log("Hit enemy");
    }
}