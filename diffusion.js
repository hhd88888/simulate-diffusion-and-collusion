var velocity = document.getElementById("velocity1");
x_axis = new Array();
radius = 5;
momentum = 0;

var speeds_r = new Array(10);
var speeds_b = new Array(10);


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

function calculate_distance(cir1, cir2) {
    return Math.sqrt(Math.pow((cir1.x - cir2.x), 2) + Math.pow((cir1.y - cir2.y), 2));
}

function move(target_balls, num) {
    for (i = 0; i < num; i++) {
        target_balls[i].x = target_balls[i].x + target_balls[i].vx;
        target_balls[i].y = target_balls[i].y + target_balls[i].vy;
    }
}

var canvas_diffusion = document.getElementById("Canvas_diffusion");
var context_diffusion = canvas_diffusion.getContext('2d');
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
var num = 200;

balls_l = new Array();
balls_r = new Array();

temp_range_l.onchange = function(e) {
    if (!diffusion_state) {
        temp_l = Number(temp_range_l.value);
        change_temp(temp_l, m1, balls_l, v_l);
    } else {
        alert("请先重置挡板");
    }
}

temp_range_r.onchange = function(e) {
    if (!diffusion_state) {
        temp_r = Number(temp_range_r.value);
        change_temp(temp_r, m2, balls_r, v_r);
    } else {
        alert("请先重置挡板");
    }
}

function change_temp(temp, m, balls, v) {
    v_new = Math.sqrt(temp / m);
    for (i = 0; i < balls.length; i++) {
        balls[i].vx = balls[i].vx * v_new / v;
        balls[i].vy = balls[i].vy * v_new / v;
    }
}


weight_range_l.onchange = function(e) {
    if (!diffusion_state) {
        m1 = Number(weight_range_l.value);
    } else {
        alert("请先重置挡板");
    }
}

weight_range_r.onchange = function(e) {
    if (!diffusion_state) {
        m2 = Number(weight_range_r.value);
    } else {
        alert("请先重置挡板");
    }
}

num_range_l.onchange = function(e) {
    if (!diffusion_state) {
        num_l = Number(num_range_l.value);
    } else {
        alert("请先重置挡板");
    }
}

num_range_r.onchange = function(e) {
    if (!diffusion_state) {
        num_r = Number(num_range_r.value);
    } else {
        alert("请先重置挡板");
    }
}

function draw_line() {

    context_diffusion.save();
    context_diffusion.beginPath();
    context_diffusion.moveTo(canvas_diffusion.width / 2, 0);
    context_diffusion.lineTo(canvas_diffusion.width / 2, canvas_diffusion.height + 2);

    if (diffusion_state) {
        context_diffusion.strokeStyle = "rgba(0, 0, 0, 0.5)";
        context_diffusion.setLineDash([10, 25]);
        context_diffusion.lineWidth = 2;
    } else {
        context_diffusion.strokeStyle = "orange";
        context_diffusion.lineWidth = 2;
    }
    context_diffusion.stroke();

    context_diffusion.restore();
}

startButton.onclick = function(e) {
    if (!diffusion_state) {
        diffusion_state = true;
        startButton.value = "重置";
    } else {
        change_temp(temp_r, m2, balls_r);
        change_temp(temp_l, m1, balls_l);
        diffusion_state = false;
        startButton.value = "取出隔板";
        temp_range_l.textContent = 50;
        temp_range_l.value = 50;
        temp_range_r.textContent = 50;
        temp_range_r.value = 50;
        weight_range_l.textContent = 5;
        weight_range_l.value = 5;
        weight_range_r.textContent = 5;
        weight_range_r.value = 5;
        num_range_l.textContent = 55;
        num_range_l.value = 55;
        num_range_r.textContent = 55;
        num_range_r.value = 55;
        m1 = Number(weight_range_l.value);
        m2 = Number(weight_range_r.value);
        num_l = Number(num_range_l.value);
        num_r = Number(num_range_r.value);
        temp_l = Number(temp_range_l.value);
        temp_r = Number(temp_range_r.value);

        generateLeftBall();
        generateRightBall();
    }
}

function generateLeftBall() {
    balls_l = new Array();
    for (i = 0; i < num / 2; i++) {
        speed_array = generateNormalDistribution(0, v_l);
        cir = new circle(10, 10, speed_array[0] / Math.sqrt(2), speed_array[1] / Math.sqrt(2), radius);
        while (true) {
            flag = false;
            x = 5 + Math.random() * (canvas_diffusion.width / 2 - 15);
            y = 5 + Math.random() * (canvas_diffusion.height - 10);
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
    for (i = 0; i < num / 2; i++) {
        speed_array = generateNormalDistribution(0, v_r);
        cir = new circle(10, 10, speed_array[0] / Math.sqrt(2), speed_array[1] / Math.sqrt(2), radius);
        while (true) {
            flag = false;
            x = canvas_diffusion.width / 2 + 10 + Math.random() * (canvas_diffusion.width / 2 - 10);
            y = 5 + Math.random() * (canvas_diffusion.height - 10);
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
        if (((balls_l[i].x) < 5 && (balls_l[i].vx <= 0)) || ((balls_l[i].x > (canvas_diffusion.width / 2 - 10)) && (balls_l[i].vx >= 0))) {
            if ((balls_l[i].x > (canvas_diffusion.width - 5)) && (balls_l[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_l[i].vx;
            }

            balls_l[i].vx = -balls_l[i].vx;
        }
        if (((balls_l[i].y < 5) && (balls_l[i].vy <= 0)) || ((balls_l[i].y > (canvas_diffusion.height - 5)) && (balls_l[i].vy >= 0))) {
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
            if ((balls_r[i].x > (canvas_diffusion.width - 5)) && (balls_r[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_r[i].vx;
            }

            balls_r[i].vx = -balls_r[i].vx;
        }
        if (((balls_r[i].y < 5) && (balls_r[i].vy <= 0)) || ((balls_r[i].y > (canvas_diffusion.height - 5)) && (balls_r[i].vy >= 0))) {
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

function draw_pressure() {
    calculate_pressure(1);
    points[point_num] = pressure / count;
    for (i = 0; i <= point_num; i++)
        draw_points(x_axis[i] / 50, anvas_diffusion.width / 2 - 20 * points[i]);
}

function diffusion_collude() {
    for (i = 0; i < num_r; i++) {
        if (((balls_r[i].x) < 5 && (balls_r[i].vx <= 0)) || ((balls_r[i].x > (canvas_diffusion.width - 5)) && (balls_r[i].vx >= 0))) {
            if ((balls_r[i].x > (canvas_diffusion.width - 5)) && (balls_r[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_r[i].vx;
            }

            balls_r[i].vx = -balls_r[i].vx;
        }
        if (((balls_r[i].y < 5) && (balls_r[i].vy <= 0)) || ((balls_r[i].y > (canvas_diffusion.height - 5)) && (balls_r[i].vy >= 0))) {
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
        if (((balls_l[i].x) < 5 && (balls_l[i].vx <= 0)) || ((balls_l[i].x > (canvas_diffusion.width - 5)) && (balls_l[i].vx >= 0))) {
            if ((balls_l[i].x > (canvas_diffusion.width - 5)) && (balls_l[i].vx >= 0) && i < num) {
                momentum = momentum + 2 * balls_l[i].vx;
            }

            balls_l[i].vx = -balls_l[i].vx;
        }
        if (((balls_l[i].y < 5) && (balls_l[i].vy <= 0)) || ((balls_l[i].y > (canvas_diffusion.height - 5)) && (balls_l[i].vy >= 0))) {
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

function collectSpeeds() {
    for (i = 0; i < 10; i++) {
        speeds_b[i] = 0;
        speeds_r[i] = 0;
    }
    for (i = 0; i < num_l; i++) {
        if (balls_l[i].velocity() >= 10) {
            speeds_r[9]++;
        } else {
            speeds_r[Math.floor(balls_l[i].velocity())]++;
        }
    }
    for (i = 0; i < num_r; i++) {
        if (balls_r[i].velocity() >= 10) {
            speeds_b[9]++;
        } else {
            speeds_b[Math.floor(balls_r[i].velocity())]++;
        }
    }
}

function drawTbale() {
    collectSpeeds();

    var option1 = {
        title: {
            text: 'Speed Distribution'
        },
        tooltip: {},
        legend: {
            data: ['speed']
        },
        xAxis: {
            data: ["[0,1)", "[1,2)", "[2,3)", "[3,4)", "[4,5)", "[5,6)", "[7,8)", "[8,9)", "[9, 10)", "[10, infi)"]
        },
        yAxis: {
            max: 70
        },
        series: [{
            name: 'speed',
            type: 'bar',
            data: [speeds_r[0], speeds_r[1], speeds_r[2], speeds_r[3], speeds_r[4], speeds_r[5], speeds_r[6], speeds_r[7],
                speeds_r[8], speeds_r[9]
            ]
        }]
    };

    option2 = {
        title: {
            text: 'Speed Distribution'
        },
        tooltip: {},
        legend: {
            data: ['speed']
        },
        xAxis: {
            data: ["[0,1)", "[1,2)", "[2,3)", "[3,4)", "[4,5)", "[5,6)", "[7,8)", "[8,9)", "[9, 10)", "[10, infi)"]
        },
        yAxis: {
            max: 70
        },
        series: [{
            name: 'speed',
            type: 'bar',
            data: [speeds_b[0], speeds_b[1], speeds_b[2], speeds_b[3], speeds_b[4], speeds_b[5], speeds_b[6], speeds_b[7],
                speeds_b[8], speeds_b[9]
            ]
        }]
    };

    chart1.setOption(option1);
    chart2.setOption(option2);
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

var chart1 = echarts.init(document.getElementById('chartContainer1'));
var option1 = {
    title: {
        text: 'Speed Distribution'
    },
    tooltip: {},
    legend: {
        data: ['speed']
    },
    xAxis: {
        data: ["[0,1)", "[1,2)", "[2,3)", "[3,4)", "[4,5)", "[5,6)", "[7,8)", "[8,9)", "[9, 10)", "[10, infi)"]
    },
    yAxis: {
        max: 70
    },
    series: [{
        name: 'speed',
        type: 'bar',
        data: [speeds_r[0], speeds_r[1], speeds_r[2], speeds_r[3], speeds_r[4], speeds_r[5], speeds_r[6], speeds_r[7],
            speeds_r[8], speeds_r[9]
        ]
    }]
};


var chart2 = echarts.init(document.getElementById('chartContainer2'));
var option2 = {
    title: {
        text: 'Speed Distribution'
    },
    tooltip: {},
    legend: {
        data: ['speed']
    },
    xAxis: {
        data: ["[0,1)", "[1,2)", "[2,3)", "[3,4)", "[4,5)", "[5,6)", "[7,8)", "[8,9)", "[9, 10)", "[10, infi)"]
    },
    yAxis: {
        max: 70
    },
    series: [{
        name: 'speed',
        type: 'bar',
        data: [speeds_b[0], speeds_b[1], speeds_b[2], speeds_b[3], speeds_b[4], speeds_b[5], speeds_b[6], speeds_b[7],
            speeds_b[8], speeds_b[9]
        ]
    }]
};

//************************************* */

var count = 0;
var t = 80;

function draw(currentTime) {
    context_diffusion.clearRect(0, 0, canvas_diffusion.width, canvas_diffusion.height);
    requestAnimFrame(draw);
    draw_temp(canvas_diffusion.width / 2 - 100, 20, diffusion_calculate(0, canvas_diffusion.width / 2));
    draw_temp(canvas_diffusion.width - 100, 20, diffusion_calculate(canvas_diffusion.width / 2, canvas_diffusion.width));
    draw_line();
    move(balls_l, num_l);
    move(balls_r, num_r);
    draw_diffusion_Balls(balls_l, num_l, "red");
    draw_diffusion_Balls(balls_r, num_r, "blue");
    if (diffusion_state) {
        diffusion_collude();
    } else {
        diffusion_collude_left();
        diffusion_collude_right();
    }
    count++;
    if (count % t == 0) {
        drawTbale();
    }
}

chart1.setOption(option1);
chart2.setOption(option2);
generateLeftBall();
generateRightBall();
draw_line();
draw();