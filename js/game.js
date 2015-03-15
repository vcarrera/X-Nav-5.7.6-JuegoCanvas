// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos
/**
 * sound effects
 */
var audiotypes={
        "mp3": "audio/mpeg",
        "mp4": "audio/mp4",
        "ogg": "audio/ogg",
        "wav": "audio/wav"
}
function ss_soundbits(sound){
    var audio_element = document.createElement('audio')
    if (audio_element.canPlayType){
        for (var i=0; i<arguments.length; i++){
            var source_element = document.createElement('source')
            source_element.setAttribute('src', arguments[i])
            if (arguments[i].match(/\.(\w+)$/i))
                source_element.setAttribute('type', audiotypes[RegExp.$1])
            audio_element.appendChild(source_element)
        }
        audio_element.load()
        audio_element.playclip=function(){
            audio_element.pause()
            audio_element.currentTime=0
            audio_element.play()
        }
        return audio_element
    }
} 
var damageS  = ss_soundbits("audio/Damage.wav");
var freeP  = ss_soundbits("audio/win.ogg");
var exploxion = ss_soundbits("audio/explosion.wav");

// Create the canvas
var sound=false;
var delay;
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
const tower={};
tower.x=canvas.width / 2;
tower.y=canvas.height / 2;
// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";
// heart image
var heartReady = false;
var heartImage = new Image();
heartImage.onload = function () {
    heartReady = true;
};
heartImage.src = "images/heart-icon.png";
// tower image
var towerReady = false;
var towerImage = new Image();
towerImage.onload = function () {
    towerReady = true;
};
towerImage.src = "images/tower.png";
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
var damage;
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
var numMonster2=1;
var arrayMonster2 = [];
var numFire=1;
var arrayFire = [];
var lives=3;
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
    var pstate = localStorage["princessesCaught"];
    var psound = localStorage["sound"];    
    if (pstate!=""&& pstate>=0)
        princessesCaught=pstate;
    if(psound!="")
        sound=psound;

    damage=false;
    lives=3;
    var o;
    var i, c;
    var random;   
    curetime=0;
    level= Math.trunc(princessesCaught/10+1);
    numOfElements=level;
    resetMap();
	hero.x = tower.x;
	hero.y = tower.y;   
    posOrig=hero;
    putInMap(hero.x,hero.y);
    putInMap(hero.x+1,hero.y-1);
    putInMap(hero.x-1,hero.y+1);
    putInMap(hero.x+1,hero.y+1);
    putInMap(hero.x-1,hero.y-1);
    for (i=0; i < numStones; i++){
        o={};        
        if (possrand(o))
            arrayStones.push(o);
    }
    possrand(princess);  

    if (princessesCaught<=1){
        numStones=5;
        numMonster=1;
        numMonster2=1;
        numFire=1;
        lives=3; 
    }else if (princessesCaught <= 5){
        numStones=7;
        numMonster=3;
        numMonster2=2;
        numFire=3;
    }else if (princessesCaught <= 10){
        numStones=7;
        numMonster=5;
        numMonster2=3;
        numFire=5;
    }else if (princessesCaught <= 15){
        numStones=7;
        numMonster=7;
        numMonster2=5;
        numFire=3;
    } else {
        numStones=7+Math.random()*level;
        numMonster=7;
        numMonster2=5+Math.random()*level;
        numFire=Math.random()*level;
    }
    for (i=0; i < numFire; i++){
        o={};        
        if (possrand(o))
            arrayFire.push(o);
    }
    for (i=0; i < numMonster; i++){
        o={};        
        if (possrand(o)){            
            arrayMonster.push(o);            
        }
        o.xs=getsigne();
        o.ys=getsigne();
    }
    for (i=0; i < numMonster2; i++){
        o={};        
        if (possrand(o))
            arrayMonster2.push(o);
    }
    delay=Date.now()+500;
};

function  elementCheck(posOrig,array){
    var freemove=true;
    for (var i=0; i < array.length; i++){        
        if (moveX && areTouchingX(posOrig,array[i],STANDARSIZE)&& areTouchingY(posOrig,array[i],STANDARSIZE-2)){
            freemove=false;
            break;
        }   
        if (moveY && areTouchingY(posOrig,array[i],STANDARSIZE)&& areTouchingX(posOrig,array[i],STANDARSIZE-2)){
            freemove=false;
            break;
        }        
    };
    return freemove;
};
function getsigne(){
    return Math.round(Math.random()) * 2 - 1;
}
function checkdmg(time){
    if (!damage && lives>0 && delay<Date.now()){
            lives--;
            if (sound)
                damageS.playclip();
            curetime=Date.now()+time;
        }            
    damage=true;
}
// Update game objects
var update = function (modifier) {
    var posaux={};
    var posFin={};
    var i, aux;
    var hs=hero.speed * modifier;
    moveX=false;
    moveY=false;
    posaux.x=hero.x;
    posaux.y=hero.y;
    posFin=posaux;
	if (38 in keysDown) { // Player holding up
        posFin.y=hero.y-hs; 
        moveY=true;
	}
	if (40 in keysDown) { // Player holding down
		posFin.y=hero.y+hs;
        moveY=true;
	}
	if (37 in keysDown) { // Player holding left
		posFin.x=hero.x-hs;
        moveX=true;
	}
	if (39 in keysDown) { // Player holding right
		posFin.x=hero.x+hs;
        moveX=true;
	}
    if (lives>0&&(moveX||moveY)&&delay<Date.now()){ 
        
        if (elementCheck(posFin,arrayStones)&&inArea(posFin)){
                hero.x = Math.round(posFin.x);
                hero.y = Math.round(posFin.y);
        }  
        
        posOrig=posaux;
        for (i=0; i < arrayMonster2.length; i++){
            posFin.x=arrayMonster2[i].x;
            posFin.y=arrayMonster2[i].y;
            if (moveX){
                aux=hero.x-arrayMonster2[i].x;
                arrayMonster2[i].xs=Math.abs(aux)/aux;
                posFin.x=arrayMonster2[i].x+arrayMonster2[i].xs * hs;
            }
             if (moveY){
                aux=hero.y-arrayMonster2[i].y;
                arrayMonster2[i].ys=Math.abs(aux)/aux;
                posFin.y=arrayMonster2[i].y+arrayMonster2[i].ys * hs;
            }            
            if (elementCheck(posFin,arrayStones) && inArea(posFin)){
                arrayMonster2[i].x=posFin.x;
                arrayMonster2[i].y=posFin.y; 
            }
            if(!elementCheck(arrayMonster2[i],arrayFire)){
                arrayMonster2.splice(i, 1);
                if (sound)
                    exploxion.playclip();
            }
        }
    }        
    moveX=true;
    moveY=true;
    for (i=0; i < arrayMonster.length; i++){
        if (Math.random()<0.01){
            arrayMonster[i].xs=getsigne();
            arrayMonster[i].ys=getsigne();
        }
        posFin.x=arrayMonster[i].x+arrayMonster[i].xs * STANDARSIZE * modifier;
        posFin.y=arrayMonster[i].y+arrayMonster[i].ys * STANDARSIZE * modifier;      
        if (elementCheck(posFin,arrayStones)&&inArea(posFin)&&elementCheck(posFin,arrayFire)&&!areTouching( posFin,tower,STANDARSIZE*3/2)){           
            arrayMonster[i].x=posFin.x;
            arrayMonster[i].y=posFin.y; 
        }else{
            arrayMonster[i].xs=getsigne();
            arrayMonster[i].ys=getsigne();
        }
    }
    if (!elementCheck(hero,arrayMonster2)){
        checkdmg(100);
    }
    if (!elementCheck(hero,arrayMonster)||!elementCheck(hero,arrayFire)){
       checkdmg(500);
    }
    if (curetime<Date.now()){      
        dmg=0;
        damage=false;
    }
    if (lives<=2){
        localStorage.setItem("princessesCaught", 0);
    }
	if (areTouching(hero,princess,STANDARSIZE/2) ) {
		princessesCaught++;
        if (sound)
            freeP.playclip();
        if (numStones < 15 && princessesCaught <10)
            numStones++;
        localStorage.setItem("princessesCaught", princessesCaught);
		reset();
	}
	
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	if(towerReady){
        ctx.drawImage(towerImage, tower.x, tower.y);
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
    if (monster2Ready){
        for(var i=0;i<arrayMonster2.length;i++){
            ctx.drawImage(monster2Image, arrayMonster2[i].x, arrayMonster2[i].y);
        }
    }
    if (heroReady&&heroDReady) {
        if (damage)
            ctx.drawImage(heroDImage, hero.x, hero.y);
        else
            ctx.drawImage(heroImage, hero.x, hero.y);
    }
   
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
    ctx.fillText("Level: "+level+"  Lives: ", 32, 12);
    if (heartReady){
        for(var i=0;i<lives;i++){
            ctx.drawImage(heartImage, 200+i*32, 8);
        }

    }
    if (lives==0){
        ctx.fillText("0", 200, 12);
    }
    ctx.fillText(" Sound: "+(sound?"on":"off"), 350,12);
	ctx.fillText("princesses released: " + princessesCaught, 32, 44);
    //ctx.fillText("s: "+arrayStones.length+ " f:"+arrayFire.length+" m: "+arrayMonster.length+" M: "+arrayMonster2.length, 32, 76);
    if (lives<=0)
        ctx.fillText("Game over",200 , 200);
};

function resertlevel(){
    localStorage.setItem("princessesCaught", 0);
    reset();
} 
// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();

    then = now;
    localStorage.setItem("sound", sound);
};


// Let's play this game!

sound=false;
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
