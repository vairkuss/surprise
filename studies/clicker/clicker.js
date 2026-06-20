$(() => {

    let maxLifes = 5;
    let lifes = maxLifes;
    let timesClicked = 0;
    let speed = 0.125;

    let headingSize = {
        x: $("#heading").outerWidth(),
        y: $("#heading").outerHeight()
    };
    
    const headingPos = () => {return $("#heding").position()};

    $("html").on("click", e => {
        if (
            ((e.pageX - headingPos().left) < headingSize.x)
            &&
            ((e.pageY - headingPos().top) < headingSize.y)
        ) {
            timesClicked++;
            speed *= 2;
            $("#heading").text(timesClicked);
        } else {
            lifes--;
            if (!lifes) {
                clearInterval(gameInterval);
                $("#gameover").css({display:"block"});
            };
            $("#health").text("o".repeat(lifes) + "ø".repeat(maxLifes - lifes));
        };
    });

    const random = () => {
        return Math.trunc(Math.random() * 2);
    };

    const decideDirection = (pos) => {
        if (!pos.left && !pos.top) {
            return random() ? [0, 1] : [1, 0];
        } else if (!pos.left && !(pos.bottom - headingSize.y)) {
            return random() ? [1, 0] : [0, -1];
        } else if (!(pos.lest - headingSize.x) && !(pos.bottom - headingSize.y)) {
            return random() ? [0, -1] : [-1, 0];
        } else if (!(pos.lest - headingSize.x) && !pos.top) {
            return random() ? [-1, 0] : [0, 1];
        };
    };

    const run = () => {
        direction = decideDirection(headingPos()); // 0:x 1:y
        $("#heading").offset({
            top: direction[1],
            left: direction[0]
        });
    };

    let gameInterval = setInterval(run, 1 / speed);

});