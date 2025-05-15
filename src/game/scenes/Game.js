import Phaser from 'phaser';
import { PlayerManager } from '../managers/PlayerManager';
import { EnemyManager } from '../managers/EnemyManager';
import { ProjectileManager } from '../managers/ProjectileManager';
import { ShopManager } from '../managers/ShopManager';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x222222);
        this.add.image(1920/2, 1080/2, 'gameBackground');

        // text style to use throughout the game
        this.textConfig = {
            fontFamily: '"Russo One", "Orbitron", sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true,
                fill: true
            }
        };

        this.roundNumber = 1;
        this.enemiesRemaining = 0;
        this.enemiesPerRound = 3; // Starting number of enemies
        this.enemiesSpawned = 0;
        this.isSpawning = false;
        this.roundActive = false;

        this.playerManager = new PlayerManager(this);
        this.enemyManager = new EnemyManager(this);
        this.projectileManager = new ProjectileManager(this);
        this.shopOpen = false;
        this.spawnIndicators = this.add.group();
        
        // Add collisions between bullets and entities
        this.physics.add.overlap(
            this.projectileManager.enemyBullets, 
            this.playerManager.player, 
            this.projectileManager.handlePlayerHit, 
            null, 
            this.projectileManager
        );
        
        this.physics.add.overlap(
            this.projectileManager.playerBullets, 
            this.enemyManager.enemies, 
            this.projectileManager.handleEnemyHit, 
            null, 
            this.projectileManager
        );
        
        // Text to display round info and enemies remaining
        this.roundText = this.add.text(16, 16, '', {
            ...this.textConfig
        }).setScrollFactor(0);
        
        this.enemyCountText = this.add.text(16, 50, '', {
            ...this.textConfig,
            color: '#ff6666'
        }).setScrollFactor(0);
        
        // Money display
        this.moneyText = this.add.text(16, 84, '', {
            ...this.textConfig,
            color: '#ffdd44'
        }).setScrollFactor(0);
        
        this.shopManager = new ShopManager(this);
        
        // Start the first round
        this.startRound();
    }
    
    update(time, delta) {
        this.playerManager.update(time, delta);
        this.enemyManager.update(time, delta);
        this.projectileManager.update(time, delta);
        
        // Calculate remaining enemies
        const enemiesLeft = (this.enemiesPerRound - this.enemiesSpawned) + this.enemyManager.enemies.getLength();
        this.enemiesRemaining = enemiesLeft;
        
        // Update on screen text
        this.roundText.setText(`Round: ${this.roundNumber}`);
        this.enemyCountText.setText(`Enemies Remaining: ${this.enemiesRemaining}`);
        this.moneyText.setText(`Money: ${this.playerManager.money}`);
        
        // Check if round is over
        if (this.roundActive && 
            this.enemiesSpawned >= this.enemiesPerRound && 
            this.enemyManager.enemies.getLength() === 0 && 
            !this.shopOpen && 
            !this.isSpawning) {
            this.endRound();
        }
        
        // Spawn next enemy if needed and not currently spawning one
        if (this.roundActive && !this.isSpawning && this.enemiesSpawned < this.enemiesPerRound) {
            this.spawnNextEnemy();
        }
    }
    
    startRound() {
        // Heal player and update healthbar
        this.playerManager.health = this.playerManager.maxHealth;
        this.playerManager.updateHealthBar();

        // Reset round variables
        this.enemiesRemaining = this.enemiesPerRound;
        this.enemiesSpawned = 0;
        
        // Show announcement text
        const roundAnnouncement = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY,
            `Round ${this.roundNumber}`,
            { 
                ...this.textConfig,
                fontSize: '64px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Fade out and remove the round announcement
        this.tweens.add({
            targets: roundAnnouncement,
            alpha: 0,
            duration: 1500,
            delay: 500,
            onComplete: () => {
                roundAnnouncement.destroy();
                this.roundActive = true;
            }
        });
    }
    
    spawnNextEnemy() {
        if (this.enemiesSpawned >= this.enemiesPerRound) {
            return;
        }
        
        this.isSpawning = true;
        
        const worldBounds = this.physics.world.bounds;
        const safeDistance = 150;
        
        // Find a random position that is not on top of player
        let x, y, distance;
        do {
            x = Phaser.Math.Between(50, worldBounds.width - 50);
            y = Phaser.Math.Between(50, worldBounds.height - 50);
            
            // Calculate distance from player
            distance = Phaser.Math.Distance.Between(
                x, y,
                this.playerManager.player.x, 
                this.playerManager.player.y
            );
        } while (distance < safeDistance);
        
        const indicator = this.add.circle(x, y, 30, 0xff0000, 0.5);
        
        // Spawn enemy and remove indicator after delay
        this.time.delayedCall(1000, () => {
            this.enemiesSpawned++;
            
            if (indicator.active) {
                this.enemyManager.spawnEnemy(x, y);
                
                // Destroy spawn indicator
                this.tweens.add({
                    targets: [indicator],
                    alpha: 0,
                    scale: 1.5,
                    duration: 300,
                    onComplete: () => {
                        indicator.destroy();
                        
                        // Add delay between enemy spawns
                        if (this.enemiesSpawned < this.enemiesPerRound) {
                            this.time.delayedCall(1250, () => {
                                this.isSpawning = false;
                            });
                        } else {
                            this.isSpawning = false;
                        }
                    }
                });
            } else {
                this.isSpawning = false;
            }
        });
    }
    
    endRound() {
        this.roundActive = false;
        
        // Remove all enemy bullets when round ends
        this.projectileManager.enemyBullets.clear(true, true);
        
        this.roundNumber++;
        this.enemiesPerRound += 1; // Add more enemies each round
        
        // Add money when round is complete (100 + up to 50 based on health remaining)
        this.playerManager.money += 100 + Math.floor((this.playerManager.health / this.playerManager.maxHealth) * 50);
        
        // Apply enemy upgrades
        const upgrades = [
            { apply: () => {if (this.enemyManager.enemyShootInterval - 20 >= 20) {this.enemyManager.enemyShootInterval -= 20}} },
            { apply: () => this.enemyManager.maxHealth += 5 },
            { apply: () => this.enemyManager.damage += 3 }
        ];
        
        // Apply random stat upgrades equal to the number of completed rounds
        for (let i = 0; i < this.roundNumber; i++) {
            const randomUpgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
            randomUpgrade.apply();
        }
        
        // Show round completed message
        const roundCompletedText = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY,
            `Round ${this.roundNumber - 1} Complete!`,
            { 
                ...this.textConfig,
                fontSize: '64px',
                color: '#44ff44',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Fade out and remove the message
        this.tweens.add({
            targets: roundCompletedText,
            alpha: 0,
            duration: 1500,
            delay: 1000,
            onComplete: () => {
                roundCompletedText.destroy();
                
                // Open shop after round is complete
                this.shopOpen = true;
                this.shopManager.show();
            }
        });
    }
}