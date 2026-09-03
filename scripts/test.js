let gavno = {s: 5, u: 7, govno: 8, p: null};
console.log(
    {...Object.keys(this.variables)
    .filter(key => "sitphbp".includes(key))
    .reduce((obj, key) => {
        obj[key] = this.variables[key];
        return obj;
    }, {})}
);