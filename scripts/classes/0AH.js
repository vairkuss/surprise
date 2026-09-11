class AH {
    
    static delay(time, func) {
        return new Promise(res => setTimeout(res, time * 1000))
        .then(() => func());
    }
    
    static holdUntill(frequency, statement, func) {
        return this.delay(1 / frequency, () => {
            if (statement()) { func() }
            else { this.holdUntill(frequency, statement, func) }
        });
    }
    
    static holdUntillClick(frequency, func) {
        let clicked = 0;
        document.body.addEventListener("click", () => { clicked = 1 }, { capture: 1, once: 1 });
        return this.holdUntill(frequency, () => clicked, func);
    }
    
    static repeatOnClicksUntill(frequency, statement, func, callback) {
        return this.holdUntillClick(frequency, () => {
            if (statement()) { callback() } else {
                func();
                this.repeatOnClicksUntill(frequency, statement, func, callback);
            }
        });
    }
    
    static repeatUntill(statement, interval, func, callback) {
        return new Promise(res => {
            this.delay(interval, () => {
                if (statement()) { func() }
                res(statement());
            });
        })
        .then(proceed => {
            if (proceed) { repeatUntill(statement, func, callback) }
            else { (callback ?? func)() }
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