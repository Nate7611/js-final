import Phaser from 'phaser';

export class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        this.enemies = this.scene.physics.add.group();

        this.enemySpeed = 80;
        this.enemyShootInterval = 800;
        this.maxHealth = 100;
        this.damage = 20;
        
        this.baseEnemySpeed = this.enemySpeed;
        this.baseEnemyShootInterval = this.enemyShootInterval;
        this.baseMaxHealth = this.maxHealth;
        this.baseDamage = this.damage;
    }

    spawnEnemy(x, y) {
        const enemy = this.scene.add.polygon(x, y, [0, 0, 40, 0, 20, 40], 0xff0000);
        this.enemies.add(enemy);
        enemy.body.setCollideWorldBounds(true);
        enemy.health = this.maxHealth;
       
        this.createHealthBar(enemy);
       
        this.scene.time.addEvent({
            delay: this.enemyShootInterval,
            loop: true,
            callback: () => this.scene.projectileManager.enemyShootAtPlayer(enemy),
        });
    }

    createHealthBar(enemy) {
        const barBg = this.scene.add.rectangle(
            enemy.x,
            enemy.y - 30,
            50,
            8,
            0x808080
        );
       
        const bar = this.scene.add.rectangle(
            enemy.x,
            enemy.y - 30,
            50,
            8,
            0x00ff00
        );
        
        bar.setOrigin(0, 0.5);
        bar.x = enemy.x - 25;
       
        enemy.healthBarBg = barBg;
        enemy.healthBar = bar;
    }

    update(time, delta) {
        this.enemies.getChildren().forEach(enemy => {
            if (!enemy.active) return;
           
            const dx = this.scene.playerManager.player.x - enemy.x;
            const dy = this.scene.playerManager.player.y - enemy.y;
            const angle = Math.atan2(dy, dx);
           
            enemy.body.setVelocity(
                Math.cos(angle) * this.enemySpeed,
                Math.sin(angle) * this.enemySpeed
            );
           
            if (enemy.healthBarBg && enemy.healthBar) {
                enemy.healthBarBg.setPosition(enemy.x, enemy.y - 30);
                enemy.healthBar.setPosition(enemy.x - 25, enemy.y - 30);
            }
        });
    }

    damageEnemy(enemy, damage = 20) {
        enemy.health -= damage;
       
        if (enemy.healthBar) {
            const healthPercentage = Math.max(0, enemy.health / this.maxHealth);
            
            enemy.healthBar.width = 50 * healthPercentage;
           
            if (healthPercentage < 0.3) {
                enemy.healthBar.fillColor = 0xff0000;
            } else if (healthPercentage < 0.6) {
                enemy.healthBar.fillColor = 0xffff00;
            }
        }
       
        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }
   
    killEnemy(enemy) {
        if (enemy.healthBarBg) enemy.healthBarBg.destroy();
        if (enemy.healthBar) enemy.healthBar.destroy();
       
        const enemyX = enemy.x;
        const enemyY = enemy.y;
        
        enemy.destroy();
        
        const explosion = this.scene.add.circle(enemyX, enemyY, 30, 0xffa500);
        this.scene.tweens.add({
            targets: explosion,
            scale: 0,
            alpha: 0,
            duration: 300,
            onComplete: () => explosion.destroy()
        });
    }
}