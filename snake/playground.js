let k = [...Array(4)].map(
    (_, i) => {
        return {
            direction: `${i}`,
             cords: [0,0]
                .map(
                    (v, j) => v + Math.trunc(Math.sin((i - j) * 0.5 * Math.PI))
                )
        }
    }
);

console.log(k)