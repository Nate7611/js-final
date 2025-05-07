import Phaser from 'phaser';
import { PlayerManager } from '../managers/playerManager';
import { EnemyManager } from '../managers/enemyManager';
import { ProjectileManager } from '../managers/projectileManager';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x222222);

        this.roundNumber = 1;
        this.waveNumber = 1;

        this.maxWave = 1;

        this.playerManager = new PlayerManager(this);
        this.enemyManager = new EnemyManager(this);
        this.projectileManager = new ProjectileManager(this);

        // Add collisions between bullets and entities
        this.physics.add.overlap(
            this.projectileManager.enemyBullets, this.playerManager.player, this.projectileManager.handlePlayerHit, null, this.projectileManager
        );

        this.physics.add.overlap(
            this.projectileManager.playerBullets, this.enemyManager.enemies, this.projectileManager.handleEnemyHit, null, this.projectileManager
        );

        // text object to display round/wave numbers
        this.waveText = this.add.text(16, 16, '', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setScrollFactor(0);
    }

    update(time, delta) {
        this.playerManager.update(time, delta);
        this.enemyManager.update(time, delta);
        this.projectileManager.update(time, delta);

        // Update on-screen text
        this.waveText.setText(`Round: ${this.roundNumber}  Wave: ${this.waveNumber}/${this.maxWave}`);

        // Check if round is over
        if (this.enemyManager.enemies.getLength() <= 0) {
            if (this.waveNumber >= this.maxWave) {
                this.waveNumber = 1;
                this.roundNumber++;
                this.maxWave++;

                this.enemyManager.spawnEnemies();
            }
            else {
                this.waveNumber++;
                this.enemyManager.spawnEnemies();
            }
        }
    }
}