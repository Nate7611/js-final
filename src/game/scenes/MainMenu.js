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
            this.showTutorialBox();
        });
    }

    showTutorialBox() {
        // Create overlay
        const overlay = this.add.rectangle(1920 / 2, 1080 / 2, 1920, 1080, 0x000000, 0.6);
        overlay.setDepth(5);

        const tutorialBox = this.add.rectangle(1920 / 2, 1080 / 2, 1000, 500, 0xffffff, 1)
            .setStrokeStyle(4, 0x4488ff)
            .setDepth(6);

        const tutorialText = this.add.text(1920 / 2, 1080 / 2 - 200,
            "Move with mouse clicking.\n\n" +
            "Press spacebar while an enemy is in your attack range (Red circle) to stop moving and shoot them. Make sure to dodge enemy bullets! \n\n" +
            "After each round you will earn money, with bonus money being given based on your health.\n\n" +
            "You will then be able to upgrade your character in the shop, but enemies will also get stronger each round and there will be more enemies each round.\n\n",
            {
                ...this.textConfig,
                fontSize: '28px',
                color: '#ffffff',
                wordWrap: { width: 900 }
            }
        ).setOrigin(0.5, 0).setDepth(6);

        // Close button
        const closeButton = this.createButton(1920 / 2, 1080 / 2 + 200, 200, 60, 0xaa0000, 'CLOSE');
        closeButton.background.setDepth(6);
        closeButton.text.setDepth(6);

        closeButton.background.on('pointerdown', () => {
            overlay.destroy();
            tutorialBox.destroy();
            tutorialText.destroy();
            closeButton.background.destroy();
            closeButton.text.destroy();
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