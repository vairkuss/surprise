/* Animation Handler */

import { AF } from "../0/AF.js";


class AH { // Animation Handler
    
    static async play(char, animation, pose, pause) {
        console.info(`playing ${{ animation, pose }} for ${char}`);
        // play frame animation
        // set after-pose
    }
    
    static jump(char) {
        // character sprite jumps
    }
    
    static startTailwagging(facingUser) {
        // set interval
        // if (facingUser) ::before
        // else ::after
    }
    
    static patpat(char) {
        console.info(`you've patted ${char}`);
        // start animation tailwagging on ::before
        // await pointerdown
        // moving pointer left and right changes curFrame cursor untill pointerup
        // end animation or phrase
    }
    
    static wagwag(char) {
        console.info(`${char} showed his back and wagged his tail`);
        // turn character and start animation tailwagging on ::after
        // await pointerdown
        // end animation or phrase
    }
}
