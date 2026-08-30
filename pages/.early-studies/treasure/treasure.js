$(() => {
    
    let bodyStyles = window.getComputedStyle(document.body);
    let size = bodyStyles.getPropertyPriority("--size");
    let dotSize = bodyStyles.getPropertyValue("--dot-size");

    const maxLifes = 10;
    let lifes = maxLifes;

    let won = 0;
    let lost = 0;

    let bias = {
        x: ($("#map").outerWidth(1) - $("#map").innerWidth()) / 2,
        y: ($("#map").outerHeight(1) - $("#map").innerHeight()) / 2
    };

    function newGoal() {
        return {
            x: Math.trunc(Math.random() * size),
            y: Math.trunc(Math.random() * size)
        };
    };

    let goal = newGoal();

    $("#map").on("click", e => {
        if (lifes) {
            lifes--;

            let click = {
                x: e.pageX - bias.x,
                y: e.pageY - bias.y
            };

            let dist = Math.trunc(
                Math.sqrt(
                    (click.x - treasure.x) ** 2
                    + (click.y - treasure.y) ** 2
                ) * 100 / size ** 2
            );

            let status = [
                "<span>" + "o".repeat(lifes) + "ø".repeat(maxLifes - lifes) + "</span>"
            ];

            let end = 1;
            
            if (dist < dotSize) {
                lifes = 0;
                won++;
                status.push("You win!");
            } else if (lifes) {
                end = 0;
                status.push(
                    "Your position: ( " + click.x + " ; " + click.y + " )",
                    "Distantion: " + dist + "%"
                )
            } else {
                end = 2;
                lost++;
                status.push("You've lost!");
            };

            if (end) {
                if (won) status.push("Times won: " + won);
                if (lost) status.push("Times lost: " + lost);
                status.push("<span>click here to play again</span>");

                $("#pointer").css({
                    display: "block",
                    left: treasure.x + bias.x,
                    top: treasure.y + bias.y
                });  
            };
            
            $("#status").html(status.join("<br>"));
            $("#status").css({color:"hsl(" + Math.trunc(dist * 2.55) + ", 100%, 60%)"});
            // flash `text-shadow` of `#status span` with green if won else red
            // flash `box-shadow` of `#status` with delay
        };
    });

    $("#status").on("click", e => {
        if (!lifes) {
            lifes = maxLifes;
            $("#status").html(
                "<span>" + "o".repeat(maxLifes) + "</span><br>"
                + "Your position: ( ??? ; ??? )<br>"
                + "Distantion: ???"
            );
            goal = newGoal();
            $("#pointer").css({display:"none"});
        };
    });
});