class AH {
    
    static delay(time, callback) {
        return new Promise(res => setTimeout(res, time * 1000))
        .then(() => callback());
    }
    
    static holdUntill(frequency, statement, callback) {
        return this.delay(1 / frequency, () => {
            if (!statement()) { this.holdUntill(frequency, statement, callback) }
            else if (callback) { return callback() }
        });
    }
    
    static holdUntillClick(frequency, func) {
        let clicked = 0;
        document.body.addEventListener("click", () => { clicked = 1 }, { capture: 1, once: 1 });
        return this.holdUntill(frequency, () => clicked, func);
    }
    
    static repeatOnClicksUntill(frequency, statement, func, callback) {
        return this.holdUntillClick(frequency, () => {
            if (!statement()) {
                if (func) { func() }
                this.repeatOnClicksUntill(frequency, statement, func, callback);
            } else if (callback) { return callback() }
        });
    }
    
    static repeatUntill(interval, statement, func, callback) {
        return this.delay(interval, () => {
            if (!statement()) {
                if (func) { func() }
                this.repeatUntill(interval, statement, func, callback);
            } else if (callback) { return callback() }
        });
    }
    
    /**
    static animate(func, wantedValue, duration, fps=60, startValue=0, a=1) {
        this.delay(1/fps, () => {
            func(startValue)
        })
        .then(() => {
            startValue += a * duration / fps;
            a++;
            if (last === wantedValue) { return }
            this.animate(func, wantedValue, duration, fps, last, a);
        });
    }
    /**
    static awaitEvent(el, event, func, ...params) {
        return new Promise(res => el.once(event, res))
        .then(() => func?.call(...params));
    }
    //*/
}