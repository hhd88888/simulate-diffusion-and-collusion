var canvas = document.getElementById("Canvas");
var context = canvas.getContext("2d");
var numChange = document.getElementById("num1");
var startTime = 0;
var animateButton = document.getElementById("startButton1");
var temp_button = document.getElementById("temp");
var chart_velocity = echarts.init(document.getElementById('chartContainer'));
var chart_free_path = echarts.init(document.getElementById('chartContainer1'));

var multiplier = 336; // 1px means 336m/s, equals to sqrt(373*k/m)
var v = get_velocity();
var temp = temp_button.value;
var scope_max = 20;
var mean_free_path_data = new Array();

// get the velocity/multiplier from temp
function get_velocity() {
    var absolute_temp = parseFloat(temp_button.value) + parseFloat(373);
    return 17.2 * Math.sqrt(absolute_temp) / multiplier;
}

class ball {
    constructor(x, y, vx, vy, r) {
        this.x = x;
        this.y = y;
        this.vx = vx; // * Math.sin(Math.random() * Math.PI);
        this.vy = vy; // * Math.cos(Math.random() * Math.PI);
        this.radius = r;
        this.free_path = 0;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    velocity() {
        return Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
    }

    draw() {
        context.save();

        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = "cornflowerblue";
        context.fill();
        context.lineWidth = 0.5;
        context.stroke();

        context.restore();
    }

    move() {
        this.x = this.x + this.vx;
        this.y = this.y + this.vy;
        this.free_path = this.free_path + this.velocity();
    }
};

class balls {
    constructor(max_num, num, radius) {
        this.max_num = parseInt(max_num);
        this.num = parseInt(num);
        this.mean_free_path = 0;
        this.balls = new Array();
        this.speeds = new Array();
        this.radius = parseInt(radius);
        this.free_path = 0;
        this.collide_num = 0;
        this.change_point = 0;
    }

    init() {
        for (i = 0; i < this.max_num; i++) {
            speed_array = generateNormalDistribution(0, v);
            var particle = new ball(10, 10, speed_array[0], speed_array[1], this.radius);
            while (true && i != 0) {
                var flag = false;
                var x = 5 + Math.random() * (canvas.width - 10);
                var y = 5 + Math.random() * (canvas.height - 10);
                particle.setPosition(x, y);
                for (var j = 0; j < this.balls.length; j++) {
                    if (calculate_distance(particle, this.balls[j]) < (4 * this.radius)) {
                        flag = true;
                    }
                }
                if (!flag) {
                    break;
                }
            }
            this.balls.push(particle);
        }

        return balls;
    }

    draw() {
        for (i = 0; i < this.num; i++) {
            this.balls[i].draw();
        }
    }

    run() {
        for (i = 0; i < this.num; i++) {
            this.balls[i].move();
        }
    }

    collide() {
        for (var i = 0; i < this.num; i++) {
            // if collide with the wall
            if (((this.balls[i].x) < 5 && (this.balls[i].vx <= 0)) || ((this.balls[i].x > (canvas.width - 5)) && (this.balls[i].vx >= 0))) {

                this.balls[i].vx = -this.balls[i].vx;
            }
            if (((this.balls[i].y < 5) && (this.balls[i].vy <= 0)) || ((this.balls[i].y > (canvas.height - 5)) && (this.balls[i].vy >= 0))) {
                this.balls[i].vy = -this.balls[i].vy;
            }

            // collide with other particles
            for (var j = 0; j < i; j++) {
                if (calculate_distance(this.balls[i], this.balls[j]) <= 2 * radius) {
                    var dis = calculate_distance(this.balls[i], this.balls[j]);
                    var vi_trans = (this.balls[i].vx * (this.balls[i].x - this.balls[j].x) / dis) + (this.balls[i].vy * (this.balls[i].y - this.balls[j].y) / dis);
                    //the velocity vertical to the line of the two this.balls
                    var vi_long = -(this.balls[i].vx * (this.balls[i].y - this.balls[j].y) / dis) + (this.balls[i].vy * (this.balls[i].x - this.balls[j].x) / dis);

                    var vj_trans = (this.balls[j].vx * (this.balls[i].x - this.balls[j].x) / dis) + (this.balls[j].vy * (this.balls[i].y - this.balls[j].y) / dis);
                    var vj_long = -(this.balls[j].vx * (this.balls[i].y - this.balls[j].y) / dis) + (this.balls[j].vy * (this.balls[i].x - this.balls[j].x) / dis);

                    //if collide
                    if (vi_trans - vj_trans <= 0) {
                        this.balls[i].vx = (vj_trans * (this.balls[i].x - this.balls[j].x) / dis) - (vi_long * (this.balls[i].y - this.balls[j].y) / dis);
                        this.balls[i].vy = (vj_trans * (this.balls[i].y - this.balls[j].y) / dis) + (vi_long * (this.balls[i].x - this.balls[j].x) / dis);

                        this.balls[j].vx = (vi_trans * (this.balls[i].x - this.balls[j].x) / dis) - (vj_long * (this.balls[i].y - this.balls[j].y) / dis);
                        this.balls[j].vy = (vi_trans * (this.balls[i].y - this.balls[j].y) / dis) + (vj_long * (this.balls[i].x - this.balls[j].x) / dis);

                        // calculate free path
                        this.free_path += this.balls[i].free_path + this.balls[j].free_path;
                        this.balls[i].free_path = 0;
                        this.balls[j].free_path = 0;
                        this.collide_num += 2;
                    }
                }
            }
        }
    }

    collectSpeeds() {
        this.speeds = [];
        var interval = Math.ceil(v * 3 * multiplier / 200) * 200 / 20;
        var sum = 0;
        var max = 0;
        for (var i = 0; i < 20; i++) {
            for (var j = 0; j < this.num; j++) {
                if (this.balls[j].velocity() * multiplier >= i * interval && this.balls[j].velocity() * multiplier < ((i + 1) * interval)) {
                    sum++;
                }
            }
            this.speeds.push([i * interval, (i + 1) * interval, sum]);
            if (sum > max) {
                max = sum;
            }
            sum = 0;
        }
    }

    collect_free_path() {
        this.mean_free_path = parseFloat(this.free_path) / parseFloat(parseInt(this.collide_num) - parseInt(this.change_point));
        mean_free_path_data.push([this.collide_num, parseFloat(this.mean_free_path) * 0.2]);
    }
}

points = new Array()
x_axis = new Array();
radius = 5;
count = 0;
t = 20;
momentum = 0;
var num = numChange.value;
var total_num = 200;
var particles = new balls(total_num, num, radius);
var state = false;

function init() {
    for (i = 0; i < total_num; i++) {
        x_axis[i] = 0;
        points[i] = 0;
    }
    x_axis[0] = num * v * v;
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
    particles.num = num;
    particles.free_path = 0;
    particles.chang_point = particles.collide_num;
    momentum = 0;
    count = 0;
}

temp_button.onchange = function(e) {
    var new_temp = parseFloat(temp_button.value);
    for (var i = 0; i < particles.max_num; i++) {
        particles.balls[i].vx = particles.balls[i].vx * Math.sqrt((new_temp + 373) / (parseFloat(temp) + 373));
        particles.balls[i].vy = particles.balls[i].vy * Math.sqrt((new_temp + 373) / (parseFloat(temp) + 373));
    }
    temp = new_temp;
    v = get_velocity();
}

function calculate_distance(ball1, ball2) {
    return Math.sqrt(Math.pow((ball1.x - ball2.x), 2) + Math.pow((ball1.y - ball2.y), 2));
}


function calculate_pressure(coefficient) {
    pressure = momentum * coefficient;
}

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

function generateNormalDistribution(mu, sigma) {
    u1 = Math.random();
    u2 = Math.random();
    mag = sigma * Math.sqrt(-2.0 * Math.log(u1));

    vx = mag * Math.cos(2 * Math.PI * u2) + mu;
    vy = mag * Math.sin(2 * Math.PI * u2) + mu;

    speed_array = new Array(vx, vx);

    return speed_array;
}

function renderItem(params, api) {
    // 这个根据自己的需求适当调节
    var yValue = api.value(2);
    var start = api.coord([api.value(0), yValue]);
    var size = api.size([api.value(1) - api.value(0), yValue]);
    var style = api.style();

    return {
        // 矩形及配置
        type: 'rect',
        shape: {
            x: start[0] + 1,
            y: start[1],
            width: size[0] - 2,
            height: size[1]
        },
        style: style
    };
}

function init_free_path_table() {
    var option = {
        title: {
            text: 'mean free path'
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['mean free path'],
        },
        xAxis: {
            name: 'number of collisions',
            nameLocation: 'middle',
            type: 'value',
            nameTextStyle: {
                padding: [15, 0, 0, 0],
                fontSize: 15
            },
            min: 0,
            max: 'dataMax'
        },
        yAxis: {
            name: 'mean free path',
            nameLocation: 'middle',
            nameTextStyle: {
                padding: [0, 0, 15, 0],
                fontSize: 15
            },
            type: 'value',
            min: 0,
            max: 100
        },
        series: [{
            name: 'mean free path',
            type: 'line',
            data: []

        }]
    }

    chart_free_path.setOption(option);
}

function init_velocity_table() {

    var option_velocity = {
        title: {
            text: 'Speed Distribution'
        },
        tooltip: {},
        legend: {
            data: ['particles']
        },
        xAxis: {
            name: 'speed',
            nameTextStyle: {
                padding: [15, 0, 0, 0],
                fontSize: 15
            },
            nameLocation: 'middle',
            type: 'value',
            max: Math.ceil(v * 3 * multiplier / 500) * 500
        },
        yAxis: {
            name: 'number of particles',
            nameTextStyle: {
                padding: [0, 0, 15, 0],
                fontSize: 15
            },
            nameLocation: 'middle',
            type: 'value',
            min: 0,
            max: Math.ceil(particles.num / 4 / 10) * 10
        },
        series: [{
            name: 'particles',
            type: 'custom',
            renderItem: renderItem,
            data: [0, 0, 0]
        }]
    };

    chart_velocity.setOption(option_velocity);
}

function init_table() {
    init_free_path_table();
    init_velocity_table();
}

function drawTable() {
    drawTable_velocity();
    drawTable_free_path();
}

function drawTable_free_path() {
    particles.collect_free_path();
    var option = {
        title: {
            text: 'mean free path'
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['mean free path'],
        },
        xAxis: {
            name: 'number of collisions',
            nameLocation: 'middle',
            type: 'value',
            nameTextStyle: {
                padding: [15, 0, 0, 0],
                fontSize: 15
            },
            min: 0,
            max: 'dataMax'
        },
        yAxis: {
            name: 'mean free path',
            nameLocation: 'middle',
            nameTextStyle: {
                padding: [0, 0, 15, 0],
                fontSize: 15
            },
            type: 'value',
            min: 0,
            max: 100
        },
        series: [{
            name: 'mean free path',
            type: 'line',
            data: mean_free_path_data,

        }]
    }

    chart_free_path.setOption(option);
}

function drawTable_velocity() {
    particles.collectSpeeds();
    var option_velocity = {
        title: {
            text: 'Speed Distribution'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['number of particles']
        },
        xAxis: {
            name: 'speed',
            nameTextStyle: {
                padding: [15, 0, 0, 0],
                fontSize: 15
            },
            nameLocation: 'middle',
            type: 'value',
            min: 0,
            max: Math.ceil(v * 3 * multiplier / 500) * 500
        },
        yAxis: {
            name: 'number of particles',
            nameTextStyle: {
                padding: [0, 0, 15, 0],
                fontSize: 15
            },
            nameLocation: 'middle',
            type: 'value',
            min: 0,
            max: Math.ceil((particles.num / 5 / 5) + 1) * 5
        },
        series: [{
            name: 'number of particles',
            type: 'custom',
            renderItem: renderItem,
            data: particles.speeds
        }]
    };

    chart_velocity.setOption(option_velocity);
}

function draw(currentTime) {
    requestAnimFrame(draw);

    if (state) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        particles.collide(num, balls, true);
        particles.run(balls, num);
        if (count % t == 0) {
            drawTable();
        }
    } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
    count = count + 1;
    particles.draw();
}

function main() {
    particles.init();
    init_table();
    draw();
}

init();
main();