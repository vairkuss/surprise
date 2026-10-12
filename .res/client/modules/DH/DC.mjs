/* Direction Calculator */


export default class DC { // Direction Calculator

    static direction(rad) {
        return [Math.cos(rad), -Math.sin(rad)];
    }
    
    static cords(rad, l, bias) {
         return this.direction(rad).map((v, i) => v * l + bias);
     }
}
