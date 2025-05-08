import Phaser from 'phaser';
import { PlayerManager } from '../managers/playerManager';
import { EnemyManager } from '../managers/enemyManager';
import { ProjectileManager } from '../managers/projectileManager';
import { ShopManager } from '../managers/shopManager';

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

        this.shopOpen = false;

        // Add collisions between bullets and entities
        this.physics.add.overlap(
            this.projectileManager.enemyBullets, this.playerManager.player, this.projectileManager.handlePlayerHit, null, this.projectileManager
        );
        this.physics.add.overlap(
            this.projectileManager.playerBullets, this.enemyManager.enemies, this.projectileManager.handleEnemyHit, null, this.projectileManager
        );

        // text to display round/wave numbers
        this.waveText = this.add.text(16, 16, '', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setScrollFactor(0);

        // money display
        this.moneyText = this.add.text(16, 50, '', {
            font: '20px Arial',
            fill: '#ffff00'
        }).setScrollFactor(0);

        this.shopManager = new ShopManager(this);
    }

    update(time, delta) {
        this.playerManager.update(time, delta);
        this.enemyManager.update(time, delta);
        this.projectileManager.update(time, delta);

        // Update on screen text
        this.waveText.setText(`Round: ${this.roundNumber}  Wave: ${this.waveNumber}/${this.maxWave}`);
        this.moneyText.setText(`money: ${this.playerManager.money}`);

        // Check if round is over
        if (this.enemyManager.enemies.getLength() <= 0 && !this.shopOpen) {
            if (this.waveNumber >= this.maxWave) {
                this.endRound();
            } else {
                this.endWave();
            }
        }
    }

    endRound() {
        // Remove all enemy bullets when round ends
        this.projectileManager.enemyBullets.clear(true, true);

        this.waveNumber = 1;
        this.roundNumber++;
        this.maxWave++;

        // Add money when round is complete
        // TODO Make this scale with player health remaining
        this.playerManager.money += 50 + (this.roundNumber * 10);

        // Apply enemy upgrades
        const upgrades = [
            { name: "Speed", apply: () => this.enemyManager.enemySpeed += 5 },
            { name: "Shoot Interval", apply: () => this.enemyManager.enemyShootInterval -= 30 },
            { name: "Max Health", apply: () => this.enemyManager.maxHealth += 15 },
            { name: "Damage", apply: () => this.enemyManager.damage += 5 }
        ];

        // Apply random stat upgrades equal to the number of completed rounds
        for (let i = 0; i < this.roundNumber; i++) {
            const randomUpgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
            randomUpgrade.apply();
        }

        // Open shop after round is complete
        this.shopOpen = true;
        this.shopManager.show();
    }

    endWave() {
        this.waveNumber++;
        this.enemyManager.spawnEnemies();
    }
}