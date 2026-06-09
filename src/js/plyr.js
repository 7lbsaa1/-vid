import Plyr from 'plyr';

document.addEventListener('DOMContentLoaded', () => {
    const playerElement = document.querySelector('#media-player');
    if (playerElement) {
        const globalPlayer = new Plyr(playerElement, {
            captions: { active: true, update: true, language: 'auto' }
        });
        window.plyrInstance = globalPlayer;
    }
});

export default Plyr;
