class AH {
    static delay(func, time, ...params) {
        return new Promise(res => setTimeout(res, time * 1000))
        .then(() => func(...params));
    }
    
    static await(el, event, func, ...params) {
        return new Promise(res => el.once(event, res))
        .then(() => func(...params));
    }
    
    static playAnim(el, frames) {
        
    }
}