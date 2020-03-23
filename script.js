function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return 0;
}

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');
let maxScore = getCookie('maxScore')

let sprite = new Image()
let pipeNorth = new Image();
let pipeSouth = new Image();


function getPipe() {
    prev_rand = rand;
    do {
        rand = Math.random()
    } while (rand < 0.1 || Math.abs(rand - prev_rand) > 0.5);
    // console.log("rand = " + rand + "  prevRand = " + prev_rand)
            
    return {
        x: cvs.width,
        y: Math.floor(rand * pipeNorth.height) - pipeNorth.height
    }
}

sprite.src = 'images/sprite.png';
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function() {
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}

const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    draw : function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}

const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 170,
    x : cvs.width/2 - 225/2,
    y : cvs.height/2 - 202/2 - 20,
    
    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
}

let bird = {
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x: 20,
    y: 100,
    frame: 0,
    rotation: 0,
    body: {
        width: 34,
        height: 26,
        collisionCoordinates: {
            width: 31,
            height: 25
        }
     },
    
    draw: () => {  
        if(frame % 5 == 0) bird.frame++;

        ctx.drawImage(sprite, bird.animation[bird.frame%4].sX, bird.animation[bird.frame%4].sY, bird.body.width, bird.body.height, bird.x, bird.y, bird.body.width, bird.body.height)
    }
}

pipeNorth.src = 'images/pipeNorth.png';
pipeSouth.src = 'images/pipeSouth.png';


const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

let constant_gap = pipeNorth.height + 85; 
let gravity = 0.2;
let jump = 4;
let score = 0;
let speed = 0;
let rand = 0.5 , prev_rand = 0.5;
let collisionDetected = false;
let pipeCountedForScore = false;
let frame = 0


document.addEventListener('keydown', () => {
    if(!collisionDetected) {
        FLAP.play()
        speed = -jump
    }
        
    else
        location.reload()
})

let pipes = []
pipes[0] = getPipe()

function draw() {
    frame++;
    bg.draw()

    pipes.forEach((pipe) => {
        ctx.drawImage(pipeNorth, pipe.x, pipe.y)
        ctx.drawImage(pipeSouth, pipe.x, pipe.y + constant_gap)
        pipe.x--;

        if (pipe.x == 100) {
            pipes.push(getPipe())
        }

        else if(bird.x > pipe.x + pipeNorth.width && !pipeCountedForScore) {
            score++;
            maxScore = Math.max(maxScore, score)
            pipeCountedForScore = true;
            SCORE_S.play()
        }

        
        else if (pipe.x + pipeNorth.width < 0) {
            pipes.shift()
            pipeCountedForScore = false;
        }

        if ((((bird.x + bird.body.collisionCoordinates.width >= pipe.x && bird.x + bird.body.collisionCoordinates.width <= pipe.x + pipeNorth.width) || 
            (bird.x >= pipe.x && bird.x <= pipe.x + pipeNorth.width)) && 
            (bird.y < (pipe.y + pipeNorth.height) || bird.y + bird.body.collisionCoordinates.height > (pipe.y + constant_gap))) || 
            (bird.y + bird.body.collisionCoordinates.height > cvs.height - fg.h)) {
                collisionDetected = true;
                HIT.play() 
            }
    })

    fg.draw()
    bird.draw()
    speed += gravity
    bird.y += speed;
    ctx.fillStyle = '#FFF'  

    if(collisionDetected) {
        gameOver.draw()   
        window.cancelAnimationFrame(draw);
        ctx.font = "25px Teko";
        ctx.fillText(score, 222, 229);
        ctx.strokeText(score, 222, 229);
        ctx.fillText(maxScore, 222, 271);
        ctx.strokeText(maxScore, 222, 271);
        document.cookie = 'maxScore=' + maxScore
    }
    else {
        ctx.lineWidth = 2;
        ctx.font = "35px Teko";
        ctx.fillText(score, cvs.width/2 - 10, 50);
        ctx.strokeText(score, cvs.width/2 - 10, 50);
        requestAnimationFrame(draw)
    }
}

pipeSouth.onload = () => {
    draw();
}