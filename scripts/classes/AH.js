class AH {
    
    static delay(time, func, ...params) {
        return new Promise(res => setTimeout(res, time * 1000))
        .then(() => func?.call(...params));
    }
    
    static holdUntill() {}
    
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
    
    static awaitEvent(el, event, func, ...params) {
        return new Promise(res => el.once(event, res))
        .then(() => func?.call(...params));
    }
}