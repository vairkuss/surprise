class AH {
    
    static delay(time, func, ...params) {
        return new Promise(res => setTimeout(res, time * 1000))
        .then(() => { return func.call(...params) });
    }
    
    static holdUntill(frequency, awaitingValue, func, ...params) {
        return new Promise(async res => {
            AH.delay(1/frequency, () => { return func.call(...params) })
            .then(returnValue => {
                if (returnValue === awaitingValue) { return } else { 
                    this.holdUntill(frequency, awaitingValue, func, ...params);
                }
            });
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
    //*/
    
    /**
    static awaitEvent(el, event, func, ...params) {
        return new Promise(res => el.once(event, res))
        .then(() => func?.call(...params));
    }
    //*/
}