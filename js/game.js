// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
const TOP=32;
const LEFT=32;
canvas.width = 512;
canvas.height = 480;
const RIGHT=canvas.width-64;
const BUTTON=canvas.height-64;
document.body.appendChild(canvas);
const STANDARSIZE=32;
const ROW=Math.round(canvas.width/STANDARSIZE);
const COL=Math.round(canvas.height/STANDARSIZE);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";
var heroDReady = false;
var heroDImage = new Image();
heroDImage.onload = function () {
    heroDReady = true;
};
heroDImage.src = "images/heroDamage.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

// stone image
var stoneReady = false;
var stoneImage = new Image();
stoneImage.onload = function () {
   stoneReady = true;
};
stoneImage.src = "images/stone.png";

// fire image
var fireReady = false;
var fireImage = new Image();
fireImage.onload = function () {
   fireReady = true;
};
fireImage.src = "images/Farm-Fresh_fire.png";

// monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
   monsterReady = true;
};
monsterImage.src = "images/monster.png";

// monster2 image
var monster2Ready = false;
var monster2Image = new Image();
monster2Image.onload = function () {
   monster2Ready = true;
};
monster2Image.src = "images/monster2.png";


// Game objects
var map=new Array(ROW);
var hero = {
	speed: STANDARSIZE*10 // movement in pixels per second
};
var moveX, moveY;
var dmg,damage;
var posOrig={};
var princess = {};
var princessesCaught = 0;
var numOfElements;
var numStones=5;
var arrayStones = [];
var c1 = {
    speed: STANDARSIZE*5 // movement in pixels per second
};
var numMonster=1;
var arrayMonster = [];
var numMonster2=0;
var arrayMonster2 = [];
var numFire=1;
var arrayFire = [];
var lives=1;
// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Are in area?
function inArea(o){
    var ucArea=TOP <= o.y;
    var dcArea=BUTTON >= o.y;
    var lcArea=LEFT <= o.x;
    var rcArea=RIGHT >= o.x;
    return(ucArea&&dcArea&&lcArea&&rcArea);
};
// Are they touching?
function areTouchingX(ref,o,dis){
   return (ref.x <= (o.x + dis) && o.x <= (ref.x + dis));
};   
function areTouchingY(ref,o,dis){
   
   return (ref.y <= (o.y + dis) && o.y <= (ref.y + dis));
};
function areTouching(ref,o,dis){
    return areTouchingX(ref,o,dis)&&areTouchingY(ref,o,2*dis);
};

function resetMap(){
    arrayStones=[];
    arrayMonster=[];
    arrayMonster2=[];
    arrayFire=[];
    for (var i=0; i < ROW; i++ ){
        map[i]=new Array(COL);
        for ( var j=0; j < COL;j++){
            map[i][j]=true;
        }
    }
};

function putInMap(x1,y1){
   var x, y;
    x=Math.round(x1/STANDARSIZE);
    y=Math.round(y1/STANDARSIZE);
    map[x][y]=false;    
    if (x > 1 ){
        map[x-1][y]=false;
        map[x-2][y]=false;
    }
    if (x < ROW-2){
        map[x+1][y]=false;
        map[x+2][y]=false;
    }
    if (y > 1 ){
        map[x][y-1]=false;
        map[x][y-2]=false;
    }
    if (y < COL-2){
        map[x][y+1]=false;
        map[x][y+2]=false;
    }
    if (x > 0 && y > 0)
        map[x-1][y-1]=false;
    if (x > 0 &&y < COL)
        map[x-1][y+1]=false;
     if (x < ROW &&y > 0)
        map[x+1][y-1]=false; 
     if (x < ROW &&y < COL)
        map[x+1][y+1]=false;  
};
function isFreeInMap(x1,y1){
    return map[Math.round(x1/STANDARSIZE)][Math.round(y1/STANDARSIZE)];
};
function possrand(o) {
    var randomI={};
    var count=0;
    do{
        randomI.x= Math.round(LEFT + (Math.random() * (RIGHT - LEFT)));
        randomI.y= Math.round(TOP + (Math.random() * (BUTTON - TOP)));
        if (count++ > 100){
            if (areTouching(randomI,princess,STANDARSIZE/2)){
                return false;
            }else{ 
                return true;
            }
        }
    }while(!isFreeInMap(randomI.x,randomI.y));    
    o.x=randomI.x;
    o.y=randomI.y;
    putInMap(o.x,o.y);  
    return true;
};
    

var reset = function () {
    damage=false;
    dmg=0;
    lives=3;
    var o;
    var i;
    var random;    
    level= Math.round(princessesCaught/5+1);
    numOfElements=level;
    resetMap();
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;   
    posOrig=hero;
    putInMap(hero.x,hero.y);
    for (i=0; i < numStones; i++){
        o={};        
        if (possrand(o))
            arrayStones.push(o);
    }
    possrand(princess);  

    if (princessesCaught%4==3){
        numFire++;
    }
    if (princessesCaught%6==5){
        numMonster++;
    }
    for (i=0; i < numFire; i++){
        o={};        
        if (possrand(o))
            arrayFire.push(o);
    }
    for (i=0; i < numMonster; i++){
        o={};        
        if (possrand(o))
            arrayMonster.push(o);
    }

};

function  elementCheck(posOrig,array){
    var freemove=true;
    for (var i=0; i < array.length; i++){        
        if (moveX && areTouchingX(posOrig,array[i],STANDARSIZE)&& areTouchingY(posOrig,array[i],STANDARSIZE-6)){
            freemove=false;
            break;
        }   
        if (moveY && areTouchingY(posOrig,array[i],STANDARSIZE)&& areTouchingX(posOrig,array[i],STANDARSIZE-6)){
            freemove=false;
            break;
        }        
    };
    return freemove;
};
function getsigne(){
    return Math.round(Math.random()) * 2 - 1;
}
// Update game objects
var update = function (modifier) {
    var freemove=true;
    var posaux={};
    var posFin={};
    var i;
    moveX=false;
    moveY=false;
    posaux.x=hero.x;
    posaux.y=hero.y;
    posFin=posaux;
	if (38 in keysDown) { // Player holding up
        posFin.y=hero.y-hero.speed * modifier; 
        moveY=true;
	}
	if (40 in keysDown) { // Player holding down
		posFin.y=hero.y+hero.speed * modifier;
        moveY=true;
	}
	if (37 in keysDown) { // Player holding left
		posFin.x=hero.x-hero.speed * modifier;
        moveX=true;
	}
	if (39 in keysDown) { // Player holding right
		posFin.x=hero.x+hero.speed * modifier;
        moveX=true;
	}
	
	if (moveX||moveY){
        if (dmg==0)
            damage=false; 
        if (dmg>0)
            dmg--;
        freemove=elementCheck(posFin,arrayStones);
        if (freemove&&inArea(posFin)){
                hero.x = Math.round(posFin.x);
                hero.y = Math.round(posFin.y);
        }  
        if (!elementCheck(hero,arrayFire)){
            dmg+=2;
            if (dmg>=30){
                lives--;
                dmg=0;
            }
            
            damage=true;
        }
        posOrig=posaux;
        
    }
        for (i=0; i < arrayMonster.length; i++){
            if (Math.random()<0.02){
                arrayMonster[i].xs=getsigne();
                arrayMonster[i].ys=getsigne();
            }
            posFin.x=arrayMonster[i].x+arrayMonster[i].xs * STANDARSIZE * modifier;
            posFin.y=arrayMonster[i].y+arrayMonster[i].ys * STANDARSIZE * modifier;
            if (inArea(posFin)){
                arrayMonster[i].x=posFin.x;
                arrayMonster[i].y=posFin.y; 
            }
        }
	if (lives>0&&areTouching(hero,princess,STANDARSIZE/2) ) {
		princessesCaught++;
        if (numStones < 15)
            numStones++;
		reset();
	}
	
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady&&heroDReady) {
        if (damage)
            ctx.drawImage(heroDImage, hero.x, hero.y);
        else
            ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}	
     
   if (stoneReady){
        for(var i=0;i<arrayStones.length;i++){
            ctx.drawImage(stoneImage, arrayStones[i].x, arrayStones[i].y);
        }
    }
    if (fireReady){
        for(var i=0;i<arrayFire.length;i++){
            ctx.drawImage(fireImage, arrayFire[i].x, arrayFire[i].y);
        }
    }
	if (monsterReady){
        for(var i=0;i<arrayMonster.length;i++){
            ctx.drawImage(monsterImage, arrayMonster[i].x, arrayMonster[i].y);
        }
    }
    
   
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
    ctx.fillText("level: "+level+"  Lives: " + lives, 32, 32);
	ctx.fillText("Princesses caught: " + princessesCaught, 32, 64);
    ctx.fillText("s: "+arrayStones.length+ " f:"+arrayFire.length+" m: "+arrayMonster.length+" M: "+arrayMonster2.length, 32, 96);
    if (lives<=0)
        ctx.fillText("Game over", 200, 200);
};


// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;
};


// Let's play this game!
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
