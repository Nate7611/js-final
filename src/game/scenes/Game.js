import Phaser from 'phaser';
import { PlayerManager } from '../managers/PlayerManager';
import { EnemyManager } from '../managers/EnemyManager';
import { ProjectileManager } from '../managers/ProjectileManager';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x222222);

        this.playerManager = new PlayerManager(this);
        this.enemyManager = new EnemyManager(this);
        this.projectileManager = new ProjectileManager(this);

        this.physics.add.overlap(
            this.projectileManager.enemyBullets, this.playerManager.player, this.projectileManager.handlePlayerHit, null, this.projectileManager
        );

        this.physics.add.overlap(
            this.projectileManager.playerBullets, this.enemyManager.enemies, this.projectileManager.handleEnemyHit, null, this.projectileManager
        );
    }

    update(time, delta) {
        this.playerManager.update(time, delta);
        this.enemyManager.update(time, delta);
        this.projectileManager.update(time, delta);
    }
}