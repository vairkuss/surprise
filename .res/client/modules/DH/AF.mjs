/* Wait Functions */


export default class WF { // Wait Functions
    
    static delay(time, callback) {
        return new Promise(res => setTimeout(() => {
            res(callback != null ? callback() : undefined);
        }, time * 1000));
    }
    
    static holdUntillClick(func) {
        document.body.addEventListener("click", () => func(), { capture: 1, once: 1 });
    }
    
    static repeatOnClicksUntill(beforeClick, statement, func, callback) {
        if (beforeClick && statement()) {
            return callback != null ? callback() : undefined;
        }
        return this.holdUntillClick(() => {
            if (!statement()) {
                if (func != null) func();
                return this.repeatOnClicksUntill(statement, checkBeforeClick, func, callback);
            } else if (callback != null) return callback();
        });
    }
    
    static repeatUntill(interval, statement, func, callback) {
        return this.delay(interval, () => {
            if (!statement()) {
                if (func != null) func();
                return this.repeatUntill(interval, statement, func, callback);
            } else if (callback != null) return callback();
        });
    }
}
