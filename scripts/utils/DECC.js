class DECC { // Directional Element Coordinates Calculator
    static direction(rad) {
        return [Math.cos(rad), -Math.sin(rad)];
    }
    static cords(rad, l, bias) {
         return this.direction(rad).map((v, i) => v * l + bias);
     }
}
