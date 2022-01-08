

let lastTime

const canvas = document.getElementById('canvas')
const cxt = canvas.getContext("2d")




class Shape {
    constructor(x, y, r, vx, vy, dx, dy, m) {
        this.x = x;
        this.y = y;
        this.r = r
        this.vx = vx;
        this.vy = vy;
        this.dx = dx;
        this.dy = dy;
        this.m = m;
    }

    move(dt) {
        this.x += this.vx * 5
        this.y += this.vy * 5
    }

    draw () {
        cxt.beginPath()
        cxt.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        // cxt.closePath()
        cxt.fillStyle = 'blue';
        cxt.fill()
    }
    wallCollisions () {
        if (this.x + this.r > canvas.width) {
            this.x = canvas.width - this.r
            this.vx = -this.vx
        }
        else if (this.y + this.r > canvas.height) {
            this.y = canvas.height - this.r
            this.vy = -this.vy
        }
        else if (this.y - this.r < 0) {
            this.y = this.r
            this.vy = -this.vy
        }
        else if (this.x - this.r < 0) {
            this.x = this.r
            this.vx = -this.vx
        }
    }
}

class Collision {
    constructor(o1, o2, dx, dy, d) {
        this.o1 = o1;
        this.o2 = o2;
        this.dx = dx;
        this.dy = dy;
        this.d = d
    }
}

function checkCollision(o1, o2) {
    let dx = o2.x - o1.x;
    let dy = o2.y - o1.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (d < o1.r + o2.r) {
        return  {
            collisionObj: new Collision(o1, o2, dx, dy, d),
            isCollided: true
        }
    }
    return  {
        collisionObj: null,
        isCollided: false
    }
}

function handleCollision(info) {
    let nx = info.dx /info.d; //eigenvector
    let ny = info.dy /info.d; //eigenvector
    let s = info.o1.r + info.o2.r - info.d;
    info.o1.x -= nx * s/2;
    info.o1.y -= ny * s/2;
    info.o2.x += nx * s/2;
    info.o2.y += ny * s/2;

    // Magic...
    // let k = -2 * ((info.o2.vx - info.o1.vx) * nx + (info.o2.vy - info.o1.vy) * ny) / (1/info.o1.m + 1/info.o2.m);
    let k = 100
    info.o1.vx -= k * nx / info.o1.m;  // Same as before, just added "k" and switched to "m" instead of "s/2"
    info.o1.vy -= k * ny / info.o1.m;
    info.o2.vx += k * nx / info.o2.m;
    info.o2.vy += k * ny / info.o2.m;
}








const shape = new Shape(100, 200, 10, 1, 0, 1, 1, 20)
const shape1 = new Shape(900, 200, 30, -1, 0, 1, 1, 20)

let objects = [shape, shape1]

function update (time) {

    cxt.clearRect(0, 0, canvas.width, canvas.height)

    if (lastTime !== null) {
        let dt = time - lastTime
        // console.log(dt)
        for (let shape of objects) {

            shape.move(dt)
            shape.draw()
            shape.wallCollisions()
        }

        let {collisionObj, isCollided} = checkCollision(objects[0], objects[1])
        if (isCollided) {
            handleCollision(collisionObj)
        }
    }

    // shape.draw()
    lastTime = time

    window.requestAnimationFrame(update)
}


window.requestAnimationFrame(update)
