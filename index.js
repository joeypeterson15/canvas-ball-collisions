
let isInvisible = false
let invisibilityLocked = false
let totalTime = 0
let invisibilityTime = 500
const colors = ['green', 'blue', 'black', 'yellow', ]
let i = 0


let lastTime
const canvas = document.getElementById('canvas')
const score = document.getElementById('score')
const invisScore = document.getElementById('invis')
const cxt = canvas.getContext("2d")
const MaxSpeed = 10
const SPEEDINCREASE = 1.1
const SLOWESTSPEED = 0.1
var image = document.querySelector('img')



class Shape {
    constructor(x, y, r, vx, vy, dx, dy, m, isFood=false, timeCreated=null, addInvicibility=false) {
        this.x = x;
        this.y = y;
        this.r = r
        this.vx = vx;
        this.vy = vy;
        this.dx = dx;
        this.dy = dy;
        this.m = m;
        this.isFood = isFood
        this.timeCreated = timeCreated
        this.addInvicibility = addInvicibility
    }

    move(dt) {
        if (this.vx > MaxSpeed) this.vx = MaxSpeed
        if (this.vy > MaxSpeed) this.vy = MaxSpeed
        // if (this.vx < Math.abs(SLOWESTSPEED)) this.vx = SLOWESTSPEED
        // if (this.vy < Math.abs(SLOWESTSPEED)) this.vy = SLOWESTSPEED
        this.x += this.vx * SPEEDINCREASE
        this.y += this.vy * SPEEDINCREASE

    }

    draw () {

        cxt.beginPath()
        cxt.arc(this.x, this.y, this.r, 0, Math.PI * 2)

        if (this.isFood) {
            cxt.fillStyle = 'white';
        }
        else if (this.addInvicibility) {
            cxt.fillStyle = 'green';
        }
        else cxt.fillStyle = 'blue';


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

class Player {
    constructor(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
    }

    reset () {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2
    }

    draw () {
        cxt.beginPath()
        cxt.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        cxt.fillStyle = 'black'
        cxt.fill()
    }
}

function checkFoodCollision (player, food) {
    let dx = player.x - food.x;
    let dy = player.y - food.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (d < player.r + food.r) {
        return  {
            collidedWithFood: true
        }
    }
    return  {
        collidedWithFood: false
    }
}
function checkInvisibleCollision (player, food) {
    let dx = player.x - food.x;
    let dy = player.y - food.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (d < player.r + food.r) {
        return  {
            collidedWithInvicibility: true
        }
    }
    return  {
        collidedWithInvicibility: false
    }
}
function checkLoss (player, shape) {
    let dx = player.x - shape.x;
    let dy = player.y - shape.y;
    let d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (d < player.r + shape.r) {
        return  {
            isLose: true
        }
    }
    return  {
        isLose: false
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

/*
handleCollision takes in a collision object.
It will calculate the final speeds of each of the shapes using
completely elastic principles where (linear) momentum is conserved
and kinetic energy is conserved(no energy is lost to environment).

conservation of linear momentum ==> m1v1(i) + m2v2(i) = m1v1(f) + m2v2(f)    */


function handleCollision(info) {
    let nx = info.dx /info.d; //eigenvector
    let ny = info.dy /info.d; //eigenvector
    let s = info.o1.r + info.o2.r - info.d;
    info.o1.x -= nx * s/2;
    info.o1.y -= ny * s/2;
    info.o2.x += nx * s/2;
    info.o2.y += ny * s/2;

    info.o1.vx = ((info.o1.m - info.o2.m) / (info.o1.m + info.o2.m)) * info.o1.vx + ((2 * info.o2.m)/ (info.o1.m + info.o2.m)) * info.o2.vx
    info.o1.vy = ((info.o1.m - info.o2.m) / (info.o1.m + info.o2.m)) * info.o1.vy + ((2 * info.o2.m)/ (info.o1.m + info.o2.m)) * info.o2.vy

    info.o2.vx = -((2 * info.o1.m)/ (info.o1.m + info.o2.m)) * info.o1.vx + ((info.o2.m - info.o1.m) / (info.o1.m + info.o2.m)) * info.o2.vx
    info.o2.vy = -((2 * info.o1.m)/ (info.o1.m + info.o2.m)) * info.o1.vy + ((info.o2.m - info.o1.m) / (info.o1.m + info.o2.m)) * info.o2.vy
}


function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

function checkPlayerPosition(player) {
    if (player.x + player.r > canvas.width ) {
        player.x = 1000
    }
    else if (player.x <= 0 ) {
        player.x = 0
    }
    else if (player.y >= canvas.height ) {
        player.y = canvas.height
    }
    else if (player.y <= 0 ) {
        player.y = 0
    }
}





const player = new Player(0, 0, 10)


const shape = new Shape(100, 100, 20, 20, 20, 1, 1, 400)
const shape1 = new Shape(900, 700, 15, -4, -7, 1, 1, 100)
const shape2 = new Shape(400, 800, 40, 4, -10, 1, 1, 800)

let objects = [shape, shape1, shape2]
let count = 0

function update (time) {

    count += 1;
    if (count % 10 === 1) {
        score.textContent = parseFloat(score.textContent) + 1
    }

    if (isInvisible && invisibilityTime > 0) {
      // change score
      invisibilityTime -= 1
      invisScore.textContent = invisibilityTime
    }
    if (isInvisible && invisibilityTime < 1) {
      // change score
      isInvisible = false
    //   invisibilityLocked = true
    }

    //clear the frame every paint
    cxt.clearRect(0, 0, canvas.width, canvas.height)

    player.draw()

    if (lastTime !== null) {
        let dt = time - lastTime

        for (let shape of objects) {

            shape.move(dt)
            shape.draw()
            shape.wallCollisions()
            checkPlayerPosition(player)
        }

        //check for shape collisions.
        for (let i = 0; i < objects.length; i++){
            for (let j = i + 1; j < objects.length; j++){
                let {collisionObj, isCollided} = checkCollision(objects[i], objects[j])
                if (!isInvisible && isCollided) {
                    handleCollision(collisionObj)
                }
            }
        }

        //check food/player collision
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].isFood) {
                let {collidedWithFood} = checkFoodCollision(player, objects[i])
                    if (!isInvisible && collidedWithFood) {
                        objects.splice(i,1)
                        score.textContent = parseFloat(score.textContent) + 100
                    }
            } else if (objects[i].addInvicibility) {
                let {collidedWithInvicibility} = checkInvisibleCollision(player, objects[i])
                if (collidedWithInvicibility) {
                    objects.splice(i,1)
                    invisibilityTime += 100
                    // invisScore.textContent = parseFloat(score.textContent) + 100
                    invisScore.textContent = invisibilityTime

                }
            }

            else {
        //check for loss
                if (!isInvisible) {

                    let {isLose} = checkLoss(player, objects[i])
                    if (isLose) {
                        objects = [shape, shape1, shape2]
                        score.textContent = 0
                    }

                }
            }
        }
        //check food life
        let currentTime = new Date()
        for (let i = 0; i < objects.length; i++) {
            if (objects[i].isFood) {
                if (Math.abs(currentTime - objects[i].timeCreated) >= 2500){
                    objects.splice(i,1)
                }
            }
        }

    }
    if (count % 500 === 1) { //create new object
        objects.push(new Shape(getRandomInt(0,1000), getRandomInt(0,1000), getRandomInt(5,40), getRandomInt(1,5), getRandomInt(1,5),  getRandomInt(1,5),  getRandomInt(1,5),  getRandomInt(10,1000)  ))
    }
    if (count % 1200 === 1) { //create new food
        objects.push(new Shape(getRandomInt(0,1000), getRandomInt(0,1000), getRandomInt(5,40), getRandomInt(1,5), getRandomInt(1,5),  getRandomInt(1,5),  getRandomInt(1,5),  getRandomInt(10,1000), true, new Date()  ))
    }
    if (count % 500 === 1) { //create new food
        objects.push(new Shape(getRandomInt(0,1000), getRandomInt(0,1000), getRandomInt(5,40), getRandomInt(1,5), getRandomInt(1,5),  getRandomInt(1,5),  getRandomInt(1,5),  getRandomInt(10,1000), false, new Date(), true  ))
    }


    lastTime = time

    window.requestAnimationFrame(update)
}

window.addEventListener('mousemove', e => {
    player.x = e.x
    player.y = e.y
})


let updateTime;


function invisibility () {
  if(!invisibilityLocked) {
    isInvisible = true;
  }
}

function stopInvisibility () {
  isInvisible = false;
}

invisScore.textContent = invisibilityTime

window.addEventListener('mousedown', invisibility )
window.addEventListener('mouseup', stopInvisibility)


window.requestAnimationFrame(update)
