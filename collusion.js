var canvas = document.getElementById("Canvas");
var context = canvas.getContext("2d");
// var table = document.getElementById("ptable");
// var table_context = table.getContext("2d");
var numChange = document.getElementById("num1");
var startTime = 0;
var animateButton = document.getElementById("startButton1");
var velocity = document.getElementById("velocity1");
var record = document.getElementById("recordButton");


var v = velocity.value; //velocity
balls = new Array(); //球的集合
points = new Array()
x_axis = new Array();
radius = 5;
count = 0;
t = 20;
momentum = 0;
pressure = 0;
point_num = 0;
speeds = new Array(9);

var num = numChange.value;

var total_num = 200;

var state = false;

function init() {
    for (i = 0; i < total_num; i++) {
        x_axis[i] = 0;
        points[i] = 0;
    }
    x_axis[0] = num * v * v;
}

record.onclick = function(e) {
    point_num = point_num + 1;
    x_axis[point_num] = num * v * v;
    calculate_pressure(1);
    points[point_num] = pressure / count;
    momentum = 0;
    count = 0;
}

animateButton.onclick = function(e) {
    if (!state) {
        state = true;
        animateButton.value = "停止";
    } else {
        state = false;
        animateButton.value = "开始";
    }
}

numChange.onchange = function(e) {
    num = numChange.value;
    x_axis[point_num] = num * v * v;
    momentum = 0;
    count = 0;
}

velocity.onchange = function(e) {
    for (i = 0; i < total_num; i++) {
        balls[i].vx = balls[i].vx * velocity.value / v;
        balls[i].vy = balls[i].vy * velocity.value / v;
    }
    v = velocity.value;
    x_axis[point_num] = num * v * v;
    momentum = 0;
    count = 0;
}

class circle {
    constructor(x, y, vx, vy, r) {
        this.x = x;
        this.y = y;
        this.vx = vx; // * Math.sin(Math.random() * Math.PI);
        this.vy = vy; // * Math.cos(Math.random() * Math.PI);
        this.radius = r;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    velocity() {
        return Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    }

};

function drawCircle(circle) {
    context.save();

    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    context.fillStyle = "cornflowerblue";
    context.fill();
    context.lineWidth = 0.5;
    context.stroke();

    context.restore();
}

function calculate_distance(cir1, cir2) {
    return Math.sqrt(Math.pow((cir1.x - cir2.x), 2) + Math.pow((cir1.y - cir2.y), 2));
}

function generateBall(num, balls, r) {
    for (i = 0; i < num; i++) {
        speed_array = generateNormalDistribution(0, (v/Math.sqrt(2)));
        cir = new circle(10, 10, speed_array[0], speed_array[1], r);
        while (true) {
            flag = false;
            x = 5 + Math.random() * (canvas.width - 10);
            y = 5 + Math.random() * (canvas.height - 10);
            cir.setPosition(x, y);
            for (j = 0; j < balls.length; j++) {
                if (calculate_distance(cir, balls[j]) < (4 * r)) {
                    flag = true;
                }
            }
            if (!flag) {
                break;
            }
        }
        balls.push(cir);
    }

    return balls;
}


function drawBalls(balls) {
    for (i = 0; i < num; i++) {
        drawCircle(balls[i]);
    }
}

function collude(num, balls, calculate_state) {
    for (i = 0; i < num; i++) {
        if (((balls[i].x) < 5 && (balls[i].vx <= 0)) || ((balls[i].x > (canvas.width - 5)) && (balls[i].vx >= 0))) {
            if (calculate_state) {
                if ((balls[i].x > (canvas.width - 5)) && (balls[i].vx >= 0) && i < num) {
                    momentum = momentum + 2 * balls[i].vx;
                }
            }

            balls[i].vx = -balls[i].vx;
        }
        if (((balls[i].y < 5) && (balls[i].vy <= 0)) || ((balls[i].y > (canvas.height - 5)) && (balls[i].vy >= 0))) {
            balls[i].vy = -balls[i].vy;
        }

        for (j = 0; j < i; j++) {
            if (calculate_distance(balls[i], balls[j]) <= 2 * radius) {
                dis = calculate_distance(balls[i], balls[j]);
                vi_trans = (balls[i].vx * (balls[i].x - balls[j].x) / dis) + (balls[i].vy * (balls[i].y - balls[j].y) / dis);
                //the velocity vertical to the line of the two balls
                vi_long = -(balls[i].vx * (balls[i].y - balls[j].y) / dis) + (balls[i].vy * (balls[i].x - balls[j].x) / dis);

                vj_trans = (balls[j].vx * (balls[i].x - balls[j].x) / dis) + (balls[j].vy * (balls[i].y - balls[j].y) / dis);
                vj_long = -(balls[j].vx * (balls[i].y - balls[j].y) / dis) + (balls[j].vy * (balls[i].x - balls[j].x) / dis);

                //if collude
                if (vi_trans - vj_trans <= 0) {
                    balls[i].vx = (vj_trans * (balls[i].x - balls[j].x) / dis) - (vi_long * (balls[i].y - balls[j].y) / dis);
                    balls[i].vy = (vj_trans * (balls[i].y - balls[j].y) / dis) + (vi_long * (balls[i].x - balls[j].x) / dis);

                    balls[j].vx = (vi_trans * (balls[i].x - balls[j].x) / dis) - (vj_long * (balls[i].y - balls[j].y) / dis);
                    balls[j].vy = (vi_trans * (balls[i].y - balls[j].y) / dis) + (vj_long * (balls[i].x - balls[j].x) / dis);
                }
            }
        }
    }
}

function move(target_balls, num) {
    for (i = 0; i < num; i++) {
        target_balls[i].x = target_balls[i].x + target_balls[i].vx;
        target_balls[i].y = target_balls[i].y + target_balls[i].vy;
    }
}

function calculate_pressure(coefficient) {
    pressure = momentum * coefficient;
}

// function draw_table() {
//     table_context.save();
//     table_context.beginPath();
//     table_context.moveTo(20, 400);
//     table_context.lineTo(400, 400);

//     table_context.lineWidth = 1;
//     table_context.strokeStyle = "black";
//     table_context.stroke();

//     table_context.beginPath();
//     table_context.moveTo(20, 10);
//     table_context.lineTo(20, 400);

//     table_context.lineWidth = 1;
//     table_context.strokeStyle = "black";
//     table_context.stroke();

//     table_context.beginPath();
//     table_context.moveTo(20, 10);
//     table_context.lineTo(15, 15);

//     table_context.lineWidth = 1;
//     table_context.strokeStyle = "black";
//     table_context.stroke();

//     table_context.beginPath();
//     table_context.moveTo(20, 10);
//     table_context.lineTo(25, 15);

//     table_context.lineWidth = 1;
//     table_context.strokeStyle = "black";
//     table_context.stroke();

//     table_context.beginPath();
//     table_context.moveTo(400, 400);
//     table_context.lineTo(395, 405);

//     table_context.lineWidth = 1;
//     table_context.strokeStyle = "black";
//     table_context.stroke();

//     table_context.beginPath();
//     table_context.moveTo(400, 400);
//     table_context.lineTo(395, 395);

//     table_context.lineWidth = 1;
//     table_context.strokeStyle = "black";
//     table_context.stroke();

//     table_context.restore();

//     table_context.font = "18px Arial";
//     table_context.fillText("nRT/V", 350, 420);
//     table_context.fillText("p", 0, 20);

// }

function draw_points(x, y) //待做
{
    table_context.save();
    table_context.beginPath();
    table_context.arc(20 + x, y, 5, 0, 2 * Math.PI);
    table_context.fillStyle = "red";
    table_context.fill();
    table_context.lineWidth = 0.5;
    table_context.stroke();

    table_context.restore();
}

// function draw_pressure() {
//     calculate_pressure(1);
//     points[point_num] = pressure / count;
//     for (i = 0; i <= point_num; i++)
//         draw_points(x_axis[i] / 50, 400 - 20 * points[i]);
// }


var chart = new CanvasJS.Chart("chartContainer", {
    title: {
        text: "Speed Distribution"
    },
    axisY: {
        maximum: 50,
        interval: 10,
    },
    data: [{
        // Change type to "doughnut", "line", "splineArea", etc.
        type: "column",
        dataPoints: [
            { label: "(0,1)", y: speeds[0] },
            { label: "[1,2)", y: speeds[1] },
            { label: "[2,3)", y: speeds[2] },
            { label: "[3,4)", y: speeds[3] },
            { label: "[4,5)", y: speeds[4] },
            { label: "[5,6)", y: speeds[5] },
            { label: "[7,8)", y: speeds[6] },
            { label: "[8,9)", y: speeds[7] },
            { label: "[9,10)", y: speeds[8] },
            { label: "{10,infi)", y: speeds[9] }
        ]
    }]
})

function collectSpeeds() {
    for (i = 0; i < 10; i++) {
        speeds[i] = 0;
    }
    for (i = 0; i < num; i++) {
        if (balls[i].velocity() >= 10) {
            speeds[9]++;
        } else {
            speeds[Math.floor(balls[i].velocity())]++;
        }
    }
}

function generateNormalDistribution(mu, sigma) {
    u1 = Math.random();
    u2 = Math.random();
    mag = sigma * Math.sqrt(-2.0 * Math.log(u1));

    vx = mag * Math.cos(2 * Math.PI * u2) + mu;
    vy = mag * Math.sin(2 * Math.PI * u2) + mu;

    speed_array = new Array(vx, vx);

    return speed_array;
}

function drawTbale() {
    collectSpeeds();

    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: false,
        title: {
            text: "Speed Distribution"
        },
        axisY: {
            maximum: 50,
            interval: 10
        },
        data: [{
            // Change type to "doughnut", "line", "splineArea", etc.
            type: "column",
            dataPoints: [
                { label: "(0,1)", y: speeds[0] },
                { label: "[1,2)", y: speeds[1] },
                { label: "[2,3)", y: speeds[2] },
                { label: "[3,4)", y: speeds[3] },
                { label: "[4,5)", y: speeds[4] },
                { label: "[5,6)", y: speeds[5] },
                { label: "[7,8)", y: speeds[6] },
                { label: "[8,9)", y: speeds[7] },
                { label: "[9,10)", y: speeds[8] },
                { label: "{10,infi)", y: speeds[9] }
            ]
        }]
    })
    chart.render();

}


//************************************* */
function draw(currentTime) {
    requestAnimFrame(draw);

    if (state) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        collude(num, balls, true);
        move(balls, num);
        drawBalls(balls);
        //collude(num*10, balls_calculate, true);
        //move(balls_calculate, num*10);

        count = count + 1;
        if (count % t == 0) {
            // table_context.clearRect(0, 0, canvas.width, canvas.height);
            // draw_table();
            // draw_pressure();
            drawTbale();
        }
    } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBalls(balls);
    }
}

init();
chart.render();
generateBall(total_num, balls, 5);
drawBalls(balls);
// draw_table();
draw();