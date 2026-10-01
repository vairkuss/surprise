/* AF */
/* Animation Handler */

class AH { // Animation Handler
    
    static async play(char, animation, pose, pause) {
        console.info(`playing animation for ${char}: ${animation ?? pose ?? "???"}`);
        // play animation
    }
    
    static blink(char) {
        // transparency blink
    }
    
    static patpat(char) {
        console.info(`you've patted ${char}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // swiping left and right moves image cursor untill pointerup
        // end animation
    }
    
    static wagwag(char) {
        console.info(`${char} showed his back and wagged his tail`);
        // turn character and start animation tailwagging on ::after
        // await pointerdown
        // end animation
    }
}