/* Async Functions */


class AF { // Async Functions
    
    static delay(time, callback) {
        return new Promise(res => setTimeout(res, time * 1000))
        .then(() => (callback ?? () => {})());
    }
    
    static holdUntill(frequency, statement, callback) {
        return this.delay(1 / frequency, () => {
            if (!statement()) { this.holdUntill(frequency, statement, callback) }
            else return (callback ?? () => {})();
        });
    }
    
    static holdUntillClick(frequency, func) {
        let clicked;
        document.body.addEventListener("click", () => clicked = 1, { capture: 1, once: 1 });
        return this.holdUntill(frequency, () => clicked, func);
    }
    
    static repeatOnClicksUntill(frequency, statement, checkBeforeClick, func, callback) {
        if (statement() && checkBeforeClick) return (callback ?? () => {})();
        return this.holdUntillClick(frequency, () => {
            if (!statement()) {
                if (func) func();
                this.repeatOnClicksUntill(frequency, statement, checkBeforeClick, func, callback);
            } else return (callback ?? () => {})();
        });
    }
    
    static repeatUntill(interval, statement, func, callback) {
        return this.delay(interval, () => {
            if (!statement()) {
                if (func) func();
                this.repeatUntill(interval, statement, func, callback);
            } else return (callback ?? () => {})();
        });
    }
}
