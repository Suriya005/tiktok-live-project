/**
 * Sound Manager for TikTok Live Gift Tracker
 * Handles all sound playback and configuration
 */

class SoundManager {
    constructor() {
        // Sound settings
        this.enabled = true;
        this.volume = 0.7;

        // Audio elements with base64 encoded sounds
        this.sounds = {
            gift: new Audio('sounds/test1.mp3'),
            bigGift: new Audio('sounds/test1.mp3'),
            comment: new Audio('sounds/test1.mp3')
        };

        // Add error handlers and fallback
        Object.keys(this.sounds).forEach(key => {
            this.sounds[key].addEventListener('error', (e) => {
                console.error(`Failed to load sound: ${key}`, e);
                // Fallback to base64 encoded beep sound
                this.sounds[key] = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA0PV63n8bp1IwU7jtrzxnEpBSl+zPLaizsIGGS56+OYSQwNV63o8LdmHAY4kdfy0HwvBSJ2x/DfkD8KE16z6eunVBQKRp/g8r9vIAQxh9Hz1YM0Bh1twO7imUQMD1is5++4dSQEOo3a88ZwKAUpfs3y2Is8CBdkue3kl0kMDFar5u+3ZRsFN5DX8s98LgUidfvv4phEDA9YrOjvuXYkBDqM2vPHbyoFKX7M8tqMOwgXY7jv45dJCwxWq+jwtmQcBjiP1/LPey4FI3XG79yRQAoUXbPq6qZUEwpFnt/yuHAhBDCG0PPVgjQFHW3A7eKXRQwOV6vn77h1IwY5jNryx28oBSl9y/LajDsIF2O48OSXSAwMVqvn77ZkHAU3j9fyz3ouBSN0xe/ckUAJFFyz6uilUxMKRZ7f8rdwIAQwhtDz1YI0BR1rwe7hmUYMDleq5++3dSMGOYza8sZvKAUofcvy2ow8CBZiuO/jl0kLC1ar5u+2YxwFOI3Y8s18LgQjc8Xv3JFBCRNPFVVVQVV0qVj8JEk=');
            });
        });

        // Gift names that trigger special sound (customize this!)
        this.specialGiftNames = [
            'Rose',
            'TikTok',
            'Lion',
            'Galaxy',
            'Planet',
            'Rocket',
            'Sports Car',
            'Castle',
            'Drama Queen',
            'Hand Hearts',
            'Championship',
            'Chasing the Dream',
            'Doughnut',
            'Rosa'
        ];
    }

    /**
     * Play a sound by type
     * @param {string} soundType - Type of sound: 'gift', 'bigGift', 'comment'
     */
    play(soundType) {
        if (!this.enabled) return;

        const sound = this.sounds[soundType];
        if (sound) {
            sound.volume = this.volume;
            sound.currentTime = 0;
            sound.play()
                .then(() => {
                    console.log(`Sound played: ${soundType}`);
                })
                .catch(err => {
                    console.error('Sound play error:', err);
                    console.log('Tip: Click on the page first to enable audio autoplay');
                });
        }
    }

    /**
     * Play appropriate sound for a gift
     * @param {string} giftName - Name of the gift received
     */
    playGiftSound(giftName) {
        console.log(`Gift received: ${giftName}`);
        // if (this.isSpecialGift(giftName)) {
        //     this.play('bigGift');
        // } else {
        //     this.play('gift');
        // }
    }

    /**
     * Play sound for comment
     */
    playCommentSound() {
        this.play('comment');
    }

    /**
     * Check if gift is special
     * @param {string} giftName - Name of the gift
     * @returns {boolean}
     */
    isSpecialGift(giftName) {
        return this.specialGiftNames.includes(giftName);
    }

    /**
     * Set volume (0.0 to 1.0)
     * @param {number} volume - Volume level
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Enable/disable sound
     * @param {boolean} enabled - Whether sound is enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Add custom special gift names
     * @param {string[]} giftNames - Array of gift names
     */
    addSpecialGifts(giftNames) {
        this.specialGiftNames.push(...giftNames);
    }

    /**
     * Remove special gift names
     * @param {string[]} giftNames - Array of gift names to remove
     */
    removeSpecialGifts(giftNames) {
        this.specialGiftNames = this.specialGiftNames.filter(
            name => !giftNames.includes(name)
        );
    }

    /**
     * Get current special gift names
     * @returns {string[]}
     */
    getSpecialGifts() {
        return [...this.specialGiftNames];
    }

    /**
     * Load custom sound from URL
     * @param {string} soundType - Type of sound: 'gift', 'bigGift', 'comment'
     * @param {string} url - URL of the sound file
     */
    loadCustomSound(soundType, url) {
        if (this.sounds[soundType]) {
            this.sounds[soundType] = new Audio(url);
        }
    }

    /**
     * Test play a sound
     * @param {string} soundType - Type of sound to test
     */
    test(soundType) {
        const wasEnabled = this.enabled;
        this.enabled = true;
        this.play(soundType);
        this.enabled = wasEnabled;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
