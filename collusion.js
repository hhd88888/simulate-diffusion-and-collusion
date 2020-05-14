var canvas = document.getElementById("Canvas1");
var context = canvas.getContext("2d");
var table = document.getElementById("ptable");
var table_context = table.getContext("2d");
var numChange = document.getElementById("num1");
var startTime = 0;
var animateButton = document.getElementById("startButton1");
var velocity = document.getElementById("velocity1");
var record = document.getElementById("recordButton");


var v = velocity.value;//velocity
balls = new Array();//球的集合
points = new Array()
x_axis = new Array();
radius = 5;
count = 0;
t = 10;
momentum = 0;
pressure = 0;
point_num = 0;

var state = false;

function init()
{
    for (i = 0; i < 600; i++)
    {
        x_axis[i] = 0;
        points[i] = 0;
    }
    x_axis[0] = num * v * v;
}

record.onclick = function (e){
    point_num = point_num + 1;
    x_axis[point_num] = num * v * v;
    calculate_pressure(1);
    points[point_num] = pressure / count;
    momentum = 0;
    count = 0;
}

animateButton.onclick = function (e) {
    if (!state) {
        state = true;
        animateButton.value = "停止";
    }
    else {
        state = false;
        animateButton.value = "开始";
    }
}

var num = numChange.value;

numChange.onchange = function (e) {
    num = numChange.value;
    x_axis[point_num] = num * v * v;
    momentum = 0;
    count = 0;
}

velocity.onchange = function (e) {
    for (i = 0; i < 600; i++) {
        v_temp = Math.sqrt(Math.pow(balls[i].vx, 2) + Math.pow(balls[i].vy, 2));
        balls[i].vx = balls[i].vx * velocity.value / v_temp;
        balls[i].vy = balls[i].vy * velocity.value / v_temp;
    }
    v = velocity.value;
    x_axis[point_num] = num * v * v;
    momentum = 0;
    count = 0;
}

class circle {
    constructor(x, y, angle, v, r) {
        this.x = x;
        this.y = y;
        this.vx = v * Math.sin(angle);// * Math.sin(Math.random() * Math.PI);
        this.vy = v * Math.cos(angle);// * Math.cos(Math.random() * Math.PI);
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
        angle = Math.random() * Math.PI;
        cir = new circle(10, 10, 2 * angle, v, r);
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

function draw_table() {
    table_context.save();
    table_context.beginPath();
    table_context.moveTo(20, 400);
    table_context.lineTo(400, 400);

    table_context.lineWidth = 1;
    table_context.strokeStyle = "black";
    table_context.stroke();

    table_context.beginPath();
    table_context.moveTo(20, 10);
    table_context.lineTo(20, 400);

    table_context.lineWidth = 1;
    table_context.strokeStyle = "black";
    table_context.stroke();

    table_context.beginPath();
    table_context.moveTo(20, 10);
    table_context.lineTo(15, 15);

    table_context.lineWidth = 1;
    table_context.strokeStyle = "black";
    table_context.stroke();

    table_context.beginPath();
    table_context.moveTo(20, 10);
    table_context.lineTo(25, 15);

    table_context.lineWidth = 1;
    table_context.strokeStyle = "black";
    table_context.stroke();

    table_context.beginPath();
    table_context.moveTo(400, 400);
    table_context.lineTo(395, 405);

    table_context.lineWidth = 1;
    table_context.strokeStyle = "black";
    table_context.stroke();

    table_context.beginPath();
    table_context.moveTo(400, 400);
    table_context.lineTo(395, 395);

    table_context.lineWidth = 1;
    table_context.strokeStyle = "black";
    table_context.stroke();

    table_context.restore();

    table_context.font = "18px Arial";
    table_context.fillText("nRT/V", 350, 420);
    table_context.fillText("p", 0, 20);

}

function draw_points(x, y)//待做
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


//*************second_part*****************************
var canvas_diffusion = document.getElementById("Canvas_diffusion");
var context_diffusion = canvas_diffusion.getContext("2d");
var startButton = document.getElementById("startButton2");
var weight_range_l = document.getElementById("weight_l");
var weight_range_r = document.getElementById("weight_r");
var num_range_l = document.getElementById("num_l");
var num_range_r = document.getElementById("num_r");
var temp_range_l = document.getElementById("temp_l");
var temp_range_r = document.getElementById("temp_r");

diffusion_state = false;

m1 = Number(weight_range_l.value);
m2 = Number(weight_range_r.value);
num_l = Number(num_range_l.value);
num_r = Number(num_range_r.value);
temp_l = Number(temp_range_l.value);
temp_r = Number(temp_range_r.value);
v_l = Math.sqrt(temp_l / m1);
v_r = Math.sqrt(temp_r / m2);

balls_l = new Array();
balls_r = new Array();

temp_range_l.onchange = function (e) {
    if (!diffusion_state) {
        temp_l = Number(temp_range_l.value);
        change_temp(temp_l, m1, balls_l);
    }
    else {
        alert("请先重置挡板");
    }
}

temp_range_r.onchange = function (e) {
    if (!diffusion_state) {
        temp_r = Number(temp_range_r.value);
        change_temp(temp_r, m2, balls_r);
    }
    else {
        alert("请先重置挡板");
    }
}

function change_temp(temp, m, balls) {
    v_new = Math.sqrt(temp / m);
    for (i = 0; i < balls.length; i++) {
        v_temp = Math.sqrt(Math.pow(balls[i].vx, 2) + Math.pow(balls[i].vy, 2));
        balls[i].vx = balls[i].vx * v_new / v_temp;
        balls[i].vy = balls[i].vy * v_new / v_temp;
    }
}


weight_range_l.onchange = function (e) {
    if (!diffusion_state) {
        m1 = Number(weight_range_l.value);
    }
    else {
        alert("请先重置挡板");
    }
}

weight_range_r.onchange = function (e) {
    if (!diffusion_state) {
        m2 = Number(weight_range_r.value);
    }
    else {
        alert("请先重置挡板");
    }
}

num_range_l.onchange = function (e) {
    if (!diffusion_state) {
        num_l = Number(num_range_l.value);
    }
    else {
        alert("请先重置挡板");
    }
}

num_range_r.onchange = function (e) {
    if (!diffusion_state) {
        num_r = Number(num_range_r.value);
    }
    else {
        alert("请先重置挡板");
    }
}

function draw_line() {

    context_diffusion.save();
    context_diffusion.beginPath();
    context_diffusion.moveTo(canvas.width / 2, 0);
    context_diffusion.lineTo(canvas.width / 2, canvas.height);

    if (diffusion_state) {
        context_diffusion.strokeStyle = "rgba(0, 0, 0, 0.5)";
        context_diffusion.setLineDash([10, 25]);
        context_diffusion.lineWidth = 5;
    }
    else {
        context_diffusion.strokeStyle = "orange";
        context_diffusion.lineWidth = 10;
    }
    context_diffusion.stroke();

    context_diffusion.restore();
}

startButton.onclick = function (e) {
    if (!diffusion_state) {
        diffusion_state = true;
        startButton.value = "重置";
    }
    else {
        diffusion_state = false;
        startButton.value = "取出隔板";
        temp_range_l.textContent = 25;
        temp_range_l.value = 25;
        temp_range_r.textContent = 25;
        temp_range_r.value = 25;
        weight_range_l.textContent = 5;
        weight_range_l.value = 5;
        weight_range_r.textContent = 5;
        weight_range_r.value = 5;
        num_l.textContent = 150;
        num_l.value = 150;
        num_r.textContent = 150;
        num_r.value = 150;

        generateLeftBall();
        generateRightBall();
    }
}

function generateLeftBall() {
    balls_l = new Array();
    for (i = 0; i < 300; i++) {
        angle = Math.random() * Math.PI;
        cir = new circle(10, 10, 2 * angle, v_l, radius);
        while (true) {
            flag = false;
            x = 5 + Math.random() * (canvas.width / 2 - 15);
            y = 5 + Math.random() * (canvas.height - 10);
            cir.setPosition(x, y);
            for (j = 0; j < balls_l.length; j++) {
                if (calculate_distance(cir, balls_l[j]) < (4 * radius)) {
                    flag = true;
                }
            }
            if (!flag) {
                break;
            }
        }
        balls_l.push(cir);
    }
}

function generateRightBall() {
    balls_r = new Array();
    for (i = 0; i < 300; i++) {
        angle = Math.random() * Math.PI;
        cir = new circle(10, 10, 2 * angle, v_r, radius);
        while (true) {
            flag = false;
            x = canvas.width / 2 + 10 + Math.random() * (canvas.width / 2 - 10);
            y = 5 + Math.random() * (canvas.height - 10);
            cir.setPosition(x, y);
            for (j = 0; j < balls_r.length; j++) {
                if (calculate_distance(cir, balls_r[j]) < (4 * radius)) {
                    flag = true;
                }
            }
            if (!flag) {
                break;
            }
        }
        balls_r.push(cir);
    }
}

function draw_diffusion_Balls(balls, num_diffusion, color) {
    for (i = 0; i < num_diffusion; i++) {
        draw_diffusion_Circle(balls[i], color);
    }
}

function draw_diffusion_Circle(circle, color) {
    context_diffusion.save();

    context_diffusion.beginPath();
    context_diffusion.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    context_diffusion.fillStyle = color;
    context_diffusion.fill();
    context_diffusion.lineWidth = 0.5;
    context_diffusion.stroke();

    context_diffusion.restore();
}

function diffusion_collude_left() {
    for (i = 0; i < num_l; i++) {
        if (((balls_l[i].x) < 5 && (balls_l[i].vx <= 0)) || ((balls_l[i].x > (canvas.width / 2 - 10)) && (balls_l[i].vx >= 0))) {
            if ((balls_l[i].x > (canvas.width - 5)) && (balls_l[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_l[i].vx;
            }

            balls_l[i].vx = -balls_l[i].vx;
        }
        if (((balls_l[i].y < 5) && (balls_l[i].vy <= 0)) || ((balls_l[i].y > (canvas.height - 5)) && (balls_l[i].vy >= 0))) {
            balls_l[i].vy = -balls_l[i].vy;
        }

        for (j = 0; j < i; j++) {
            if (calculate_distance(balls_l[i], balls_l[j]) <= 2 * radius) {
                dis = calculate_distance(balls_l[i], balls_l[j]);
                vi_trans = (balls_l[i].vx * (balls_l[i].x - balls_l[j].x) / dis) + (balls_l[i].vy * (balls_l[i].y - balls_l[j].y) / dis);
                //the velocity vertical to the line of the two balls_l
                vi_long = -(balls_l[i].vx * (balls_l[i].y - balls_l[j].y) / dis) + (balls_l[i].vy * (balls_l[i].x - balls_l[j].x) / dis);

                vj_trans = (balls_l[j].vx * (balls_l[i].x - balls_l[j].x) / dis) + (balls_l[j].vy * (balls_l[i].y - balls_l[j].y) / dis);
                vj_long = -(balls_l[j].vx * (balls_l[i].y - balls_l[j].y) / dis) + (balls_l[j].vy * (balls_l[i].x - balls_l[j].x) / dis);

                //if collude
                if (vi_trans - vj_trans <= 0) {
                    balls_l[i].vx = (vj_trans * (balls_l[i].x - balls_l[j].x) / dis) - (vi_long * (balls_l[i].y - balls_l[j].y) / dis);
                    balls_l[i].vy = (vj_trans * (balls_l[i].y - balls_l[j].y) / dis) + (vi_long * (balls_l[i].x - balls_l[j].x) / dis);

                    balls_l[j].vx = (vi_trans * (balls_l[i].x - balls_l[j].x) / dis) - (vj_long * (balls_l[i].y - balls_l[j].y) / dis);
                    balls_l[j].vy = (vi_trans * (balls_l[i].y - balls_l[j].y) / dis) + (vj_long * (balls_l[i].x - balls_l[j].x) / dis);
                }
            }
        }
    }
}

function diffusion_collude_right() {
    for (i = 0; i < num_r; i++) {
        if (((balls_r[i].x) < (canvas_diffusion.width / 2 + 10) && (balls_r[i].vx <= 0)) || ((balls_r[i].x > (canvas_diffusion.width - 5)) && (balls_r[i].vx >= 0))) {
            if ((balls_r[i].x > (canvas.width - 5)) && (balls_r[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_r[i].vx;
            }

            balls_r[i].vx = -balls_r[i].vx;
        }
        if (((balls_r[i].y < 5) && (balls_r[i].vy <= 0)) || ((balls_r[i].y > (canvas.height - 5)) && (balls_r[i].vy >= 0))) {
            balls_r[i].vy = -balls_r[i].vy;
        }

        for (j = 0; j < i; j++) {
            if (calculate_distance(balls_r[i], balls_r[j]) <= 2 * radius) {
                dis = calculate_distance(balls_r[i], balls_r[j]);
                vi_trans = (balls_r[i].vx * (balls_r[i].x - balls_r[j].x) / dis) + (balls_r[i].vy * (balls_r[i].y - balls_r[j].y) / dis);
                //the velocity vertical to the line of the two balls_r
                vi_long = -(balls_r[i].vx * (balls_r[i].y - balls_r[j].y) / dis) + (balls_r[i].vy * (balls_r[i].x - balls_r[j].x) / dis);

                vj_trans = (balls_r[j].vx * (balls_r[i].x - balls_r[j].x) / dis) + (balls_r[j].vy * (balls_r[i].y - balls_r[j].y) / dis);
                vj_long = -(balls_r[j].vx * (balls_r[i].y - balls_r[j].y) / dis) + (balls_r[j].vy * (balls_r[i].x - balls_r[j].x) / dis);

                //if collude
                if (vi_trans - vj_trans <= 0) {
                    balls_r[i].vx = (vj_trans * (balls_r[i].x - balls_r[j].x) / dis) - (vi_long * (balls_r[i].y - balls_r[j].y) / dis);
                    balls_r[i].vy = (vj_trans * (balls_r[i].y - balls_r[j].y) / dis) + (vi_long * (balls_r[i].x - balls_r[j].x) / dis);

                    balls_r[j].vx = (vi_trans * (balls_r[i].x - balls_r[j].x) / dis) - (vj_long * (balls_r[i].y - balls_r[j].y) / dis);
                    balls_r[j].vy = (vi_trans * (balls_r[i].y - balls_r[j].y) / dis) + (vj_long * (balls_r[i].x - balls_r[j].x) / dis);
                }
            }
        }
    }
}

function diffusion_collude_both(m1, m2) {
    for (i = 0; i < num_l; i++) {
        for (j = 0; j < num_r; j++) {
            if (calculate_distance(balls_l[i], balls_r[j]) <= 2 * radius) {
                dis = calculate_distance(balls_l[i], balls_r[j]);
                vi_trans = (balls_l[i].vx * (balls_l[i].x - balls_r[j].x) / dis) + (balls_l[i].vy * (balls_l[i].y - balls_r[j].y) / dis);
                //the velocity vertical to the line of the two balls_l
                vi_long = -(balls_l[i].vx * (balls_l[i].y - balls_r[j].y) / dis) + (balls_l[i].vy * (balls_l[i].x - balls_r[j].x) / dis);

                vj_trans = (balls_r[j].vx * (balls_l[i].x - balls_r[j].x) / dis) + (balls_r[j].vy * (balls_l[i].y - balls_r[j].y) / dis);
                vj_long = -(balls_r[j].vx * (balls_l[i].y - balls_r[j].y) / dis) + (balls_r[j].vy * (balls_l[i].x - balls_r[j].x) / dis);

                //if collude
                if (vi_trans - vj_trans <= 0) {
                    balls_l[i].vx = (((m1 - m2) * vi_trans + 2 * m2 * vj_trans) / (m1 + m2)) * ((balls_l[i].x - balls_r[j].x) / dis) - (vi_long * (balls_l[i].y - balls_r[j].y) / dis);
                    balls_l[i].vy = (((m1 - m2) * vi_trans + 2 * m2 * vj_trans) / (m1 + m2)) * ((balls_l[i].y - balls_r[j].y) / dis) + (vi_long * (balls_l[i].x - balls_r[j].x) / dis);

                    balls_r[j].vx = (((m2 - m1) * vj_trans + 2 * m1 * vi_trans) / (m1 + m2)) * ((balls_l[i].x - balls_r[j].x) / dis) - (vj_long * (balls_l[i].y - balls_r[j].y) / dis);
                    balls_r[j].vy = (((m2 - m1) * vj_trans + 2 * m1 * vi_trans) / (m1 + m2)) * ((balls_l[i].y - balls_r[j].y) / dis) + (vj_long * (balls_l[i].x - balls_r[j].x) / dis);
                }
            }
        }
    }

}

function draw_pressure()
{
    calculate_pressure(1);
    points[point_num] = pressure / count;
    for (i = 0; i <= point_num; i++)
        draw_points(x_axis[i] / 50, 400 - 20 * points[i]);
}

function diffusion_collude() {
    for (i = 0; i < num_r; i++) {
        if (((balls_r[i].x) < 5 && (balls_r[i].vx <= 0)) || ((balls_r[i].x > (canvas_diffusion.width - 5)) && (balls_r[i].vx >= 0))) {
            if ((balls_r[i].x > (canvas.width - 5)) && (balls_r[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_r[i].vx;
            }

            balls_r[i].vx = -balls_r[i].vx;
        }
        if (((balls_r[i].y < 5) && (balls_r[i].vy <= 0)) || ((balls_r[i].y > (canvas.height - 5)) && (balls_r[i].vy >= 0))) {
            balls_r[i].vy = -balls_r[i].vy;
        }

        for (j = 0; j < i; j++) {
            if (calculate_distance(balls_r[i], balls_r[j]) <= 2 * radius) {
                dis = calculate_distance(balls_r[i], balls_r[j]);
                vi_trans = (balls_r[i].vx * (balls_r[i].x - balls_r[j].x) / dis) + (balls_r[i].vy * (balls_r[i].y - balls_r[j].y) / dis);
                //the velocity vertical to the line of the two balls_r
                vi_long = -(balls_r[i].vx * (balls_r[i].y - balls_r[j].y) / dis) + (balls_r[i].vy * (balls_r[i].x - balls_r[j].x) / dis);

                vj_trans = (balls_r[j].vx * (balls_r[i].x - balls_r[j].x) / dis) + (balls_r[j].vy * (balls_r[i].y - balls_r[j].y) / dis);
                vj_long = -(balls_r[j].vx * (balls_r[i].y - balls_r[j].y) / dis) + (balls_r[j].vy * (balls_r[i].x - balls_r[j].x) / dis);

                //if collude
                if (vi_trans - vj_trans <= 0) {
                    balls_r[i].vx = (vj_trans * (balls_r[i].x - balls_r[j].x) / dis) - (vi_long * (balls_r[i].y - balls_r[j].y) / dis);
                    balls_r[i].vy = (vj_trans * (balls_r[i].y - balls_r[j].y) / dis) + (vi_long * (balls_r[i].x - balls_r[j].x) / dis);

                    balls_r[j].vx = (vi_trans * (balls_r[i].x - balls_r[j].x) / dis) - (vj_long * (balls_r[i].y - balls_r[j].y) / dis);
                    balls_r[j].vy = (vi_trans * (balls_r[i].y - balls_r[j].y) / dis) + (vj_long * (balls_r[i].x - balls_r[j].x) / dis);
                }
            }
        }
    }

    for (i = 0; i < num_l; i++) {
        if (((balls_l[i].x) < 5 && (balls_l[i].vx <= 0)) || ((balls_l[i].x > (canvas.width - 5)) && (balls_l[i].vx >= 0))) {
            if ((balls_l[i].x > (canvas.width - 5)) && (balls_l[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_l[i].vx;
            }

            balls_l[i].vx = -balls_l[i].vx;
        }
        if (((balls_l[i].y < 5) && (balls_l[i].vy <= 0)) || ((balls_l[i].y > (canvas.height - 5)) && (balls_l[i].vy >= 0))) {
            balls_l[i].vy = -balls_l[i].vy;
        }

        for (j = 0; j < i; j++) {
            if (calculate_distance(balls_l[i], balls_l[j]) <= 2 * radius) {
                dis = calculate_distance(balls_l[i], balls_l[j]);
                vi_trans = (balls_l[i].vx * (balls_l[i].x - balls_l[j].x) / dis) + (balls_l[i].vy * (balls_l[i].y - balls_l[j].y) / dis);
                //the velocity vertical to the line of the two balls_l
                vi_long = -(balls_l[i].vx * (balls_l[i].y - balls_l[j].y) / dis) + (balls_l[i].vy * (balls_l[i].x - balls_l[j].x) / dis);

                vj_trans = (balls_l[j].vx * (balls_l[i].x - balls_l[j].x) / dis) + (balls_l[j].vy * (balls_l[i].y - balls_l[j].y) / dis);
                vj_long = -(balls_l[j].vx * (balls_l[i].y - balls_l[j].y) / dis) + (balls_l[j].vy * (balls_l[i].x - balls_l[j].x) / dis);

                //if collude
                if (vi_trans - vj_trans <= 0) {
                    balls_l[i].vx = (vj_trans * (balls_l[i].x - balls_l[j].x) / dis) - (vi_long * (balls_l[i].y - balls_l[j].y) / dis);
                    balls_l[i].vy = (vj_trans * (balls_l[i].y - balls_l[j].y) / dis) + (vi_long * (balls_l[i].x - balls_l[j].x) / dis);

                    balls_l[j].vx = (vi_trans * (balls_l[i].x - balls_l[j].x) / dis) - (vj_long * (balls_l[i].y - balls_l[j].y) / dis);
                    balls_l[j].vy = (vi_trans * (balls_l[i].y - balls_l[j].y) / dis) + (vj_long * (balls_l[i].x - balls_l[j].x) / dis);
                }
            }
        }
    }

    diffusion_collude_both(m1, m2);
}

function diffusion_calculate(x_min, x_max) {
    count1 = 0;
    energy_sum = 0;
    for (i = 0; i < num_l; i++) {
        if (balls_l[i].x > x_min && balls_l[i].x < x_max) {
            count1 = count1 + 1;
            energy_sum = energy_sum + m1 * (balls_l[i].velocity() * balls_l[i].velocity());
        }
    }
    for (i = 0; i < num_r; i++) {
        if (balls_r[i].x > x_min && balls_r[i].x < x_max) {
            count1 = count1 + 1;
            energy_sum = energy_sum + m2 * (balls_r[i].velocity() * balls_r[i].velocity());
        }
    }
    mean_temp = energy_sum / count1;
    return mean_temp;
}

function draw_temp(x, y, temp) {
    context_diffusion.font = "18px Arial";
    context_diffusion.fillText("T = " + temp.toFixed(2), x, y);
}


generateLeftBall();
generateRightBall();

draw_line();

//************************************* */
function draw(currentTime) {
    requestAnimFrame(draw);

    if (diffusion_state) {
        context_diffusion.clearRect(0, 0, canvas.width, canvas.height);
        draw_line();
        move(balls_l, num_l);
        move(balls_r, num_r);
        diffusion_collude();
        draw_diffusion_Balls(balls_l, num_l, "red");
        draw_diffusion_Balls(balls_r, num_r, "blue");
        draw_temp(300, 20, diffusion_calculate(0, 400));
        draw_temp(700, 20, diffusion_calculate(400, 800));
    } else {
        context_diffusion.clearRect(0, 0, canvas.width, canvas.height);
        draw_line();
        move(balls_l, num_l);
        move(balls_r, num_r);
        diffusion_collude_left();
        diffusion_collude_right();
        draw_diffusion_Balls(balls_l, num_l, "red");
        draw_diffusion_Balls(balls_r, num_r, "blue");
        draw_temp(300, 20, diffusion_calculate(0, 400));
        draw_temp(700, 20, diffusion_calculate(400, 800));
    }

    if (state) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        collude(num, balls, true);
        move(balls, num);
        drawBalls(balls);

        //collude(num*10, balls_calculate, true);
        //move(balls_calculate, num*10);

        count = count + 1;
        if (count % t == 0) {
            table_context.clearRect(0, 0, canvas.width, canvas.height);
            draw_table();
            draw_pressure();
        }
    }
    else {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBalls(balls);
    }
}

init();
generateBall(600, balls, 5);
drawBalls(balls);
draw_table();
draw();
