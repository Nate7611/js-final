import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.image(1920 / 2, 1080 / 2, 'gameBackground');

        // Maybe I dont need to copy and paste this but I couldnt get the other one to load
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

        const gameTitle = this.add.text(
            1920 / 2,
            300,
            'EVOLUTION BLITZ',
            {
                ...this.textConfig,
                fontSize: '92px',
                color: '#4488ff',
                stroke: '#002244',
                strokeThickness: 6,
            }
        ).setOrigin(0.5);

        const playButton = this.createButton(1920 / 2, 600, 300, 80, 0x008800, 'PLAY GAME');

        const tutorialButton = this.createButton(1920 / 2, 700, 300, 80, 0x0066aa, 'TUTORIAL');

        // Add animation to play button
        this.tweens.add({
            targets: playButton.background,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add animation to title
        this.tweens.add({
            targets: gameTitle,
            y: 320,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        playButton.background.on('pointerdown', () => {
            this.scene.start('Game');
        });

        tutorialButton.background.on('pointerdown', () => {
            const tutorialURL = 'https://www.youtube.com/watch?v=example';
            window.open(tutorialURL, '_blank');
        });
    }

    // Function to create buttons
    createButton(x, y, width, height, color, text) {
        // Button background with gradient
        const background = this.add.rectangle(x, y, width, height, color, 1)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0xffffff);

        // Button text
        const buttonText = this.add.text(x, y, text, {
            ...this.textConfig,
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        background.on('pointerover', () => {
            background.setScale(1.05);
            buttonText.setScale(1.05);
        });

        background.on('pointerout', () => {
            background.setScale(1);
            buttonText.setScale(1);
        });

        return { background, text: buttonText };
    }
}