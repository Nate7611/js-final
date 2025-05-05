import StartGame from './game/main';

document.addEventListener('DOMContentLoaded', () => {

    StartGame('game-container');

});

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});