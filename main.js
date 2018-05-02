let background;
let player;
let ground;
let cursors;
let camera;

let panes = [];
let outerThis;
let gameEnded = false;
let previousYSpeed = 0;
let pauzed = false;
let pauzeKey;
let redKey;
let greenKey;
let blueKey;
let lastPauzeTime = Date.now();

const width = 1600;
const height = 700;
const maxPlayerSpeed = 300;
const playerSpeedIncrement = 150;
const maxPlayerPosition = width/3;
const bounce = 0.1;
const gravity = 1000;
const theoreticalFramesPerSecond = 60;
const groundY = height*7/10;
const jump = 1000;
const widthMultiplier = 5;
const gameSpeed = 10; //pixels per frame

let colorObstacles = [
    {width: 500, height: height, x: width, y: 0, color: "red"},
    {width: 500, height: height, x: width+500, y: 0, color: "green"},
    {width: 500, height: height, x: width+1000, y: 0, color: "blue"},
];

const config = {
    type: Phaser.AUTO,
    width: width*widthMultiplier,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload ()
{
    this.load.image('ground', 'assets/platform.png');
    this.load.image('background', 'assets/bg.png');
    this.load.image('player', 'assets/black.jpg');
    this.load.image('red', 'assets/red.jpg');
    this.load.image('green', 'assets/green.jpg');
    this.load.image('blue', 'assets/blue.jpg');

    /*this.load.image('gameOver', 'assets/game_over.png');
    this.load.image('bar', 'assets/warmth_bar.jpg');
    this.load.image('bar_back', 'assets/black.jpg');
    this.load.image('waterProjectile', 'assets/waterProjectile.png');
    this.load.image('fork', 'assets/Fork.png');
    this.load.image('spoon', 'assets/Spoon.png');
    this.load.image('knife', 'assets/Knife.png');*/

    this.load.spritesheet('RTN', 'assets/redToNeutral.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('GTN', 'assets/greenToNeutral.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('BTN', 'assets/blueToNeutral.png', { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('NTR', 'assets/neutralToRed.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('NTG', 'assets/neutralToGreen.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('NTB', 'assets/neutralToBlue.png', { frameWidth: 64, frameHeight: 64 });

    /*this.load.spritesheet('LFHappy', 'assets/LFlameboiHappy.png', { frameWidth: 96, frameHeight: 115 });
    this.load.spritesheet('LFNeutral', 'assets/LFlameboiNeutral.png', { frameWidth: 96, frameHeight: 115 });
    this.load.spritesheet('LFSad', 'assets/LFlameboiSad.png', { frameWidth: 96, frameHeight: 115 });

    this.load.spritesheet('RFHappy', 'assets/RFlameboiHappy.png', { frameWidth: 102, frameHeight: 115 });
    this.load.spritesheet('RFNeutral', 'assets/RFlameboiNeutral.png', { frameWidth: 102, frameHeight: 115 });
    this.load.spritesheet('RFSad', 'assets/RFlameboiSad.png', { frameWidth: 96, frameHeight: 115 });

    this.load.spritesheet('waterDrop', 'assets/WaterboiEnemy.png', { frameWidth: 50, frameHeight: 50 });
    this.load.spritesheet('loss', 'assets/Loss.png', { frameWidth: 115, frameHeight: 114 });*/
}

function create ()
{
    outerThis = this;
    background = this.add.tileSprite(0, 0, width*widthMultiplier*100, height, "background").setOrigin(0,0);
    cursors = this.input.keyboard.createCursorKeys();

    colorObstacles.forEach(function (positionObject) {
        let pane = outerThis.physics.add.sprite(positionObject.x,positionObject.y, positionObject.color).setOrigin(0,0).setGravityY(-gravity);
        pane.setDisplaySize(positionObject.width,positionObject.height);
        pane.width = positionObject.width;
        pane.height = positionObject.height;
        pane.body.immovable = true;
        pane.color = positionObject.color;
        panes.push(pane);
    });

    player = this.physics.add.sprite(maxPlayerPosition, groundY, "red");
    player.setBounce(bounce);
    player.setCollideWorldBounds(true);
    player.isDead = false;
    player.body.setGravityY(gravity);
    player.body.maxVelocity = {x: maxPlayerSpeed, y:1000};
    player.height = 100;
    player.width = 100;
    player.setDisplaySize(100,100);
    player.color = "red";
    player.touchingGround = false;

    ground = this.physics.add.sprite(0, height*9/10, 'ground').setOrigin(0,0).setGravityY(-gravity);
    ground.width = width*widthMultiplier;
    ground.height = height/10;
    ground.setImmovable(true);
    ground.setDisplaySize(width*widthMultiplier, height/10);

    pauzeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    redKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    greenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    blueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

    //this.physics.add.collider(player, ground);
    this.physics.add.overlap(player, ground, groundContact, null, this);
    this.physics.add.overlap(player, panes, paneContact, null, this);

    //CAMERA STUFF
    camera = this.cameras.main.setSize(width, height);
    this.cameras.main.setBounds(0, 0, width*widthMultiplier, height);
    this.cameras.main.startFollow(player);

    //ANIMATION STUFF
    this.anims.create({
         key: 'redToNeutral',
         frames: this.anims.generateFrameNumbers('RTN'),
         frameRate: 30,
         repeat: false
    });

     this.anims.create({
         key: 'greenToNeutral',
         frames: this.anims.generateFrameNumbers('GTN'),
         frameRate: 30,
         repeat: false
     });

     this.anims.create({
         key: 'blueToNeutral',
         frames: this.anims.generateFrameNumbers('BTN'),
         frameRate: 30,
         repeat: false
     });

     this.anims.create({
         key: 'neutralToRed',
         frames: this.anims.generateFrameNumbers('NTR'),
         frameRate: 30,
         repeat: false
     });

     this.anims.create({
         key: 'neutralToGreen',
         frames: this.anims.generateFrameNumbers('NTG'),
         frameRate: 30,
         repeat: false
     });

    this.anims.create({
        key: 'neutralToBlue',
        frames: this.anims.generateFrameNumbers('NTB'),
        frameRate: 30,
        repeat: false
    });
}

function update ()
{
    if(!player.touchingGround){
        player.setGravityY(gravity);
    }

    if(!pauzed){
        moveBackground();
        moveObjects();
        player.x += 1;
    }

    if(player.x > maxPlayerPosition){
        player.x = maxPlayerPosition;
    }

    if (cursors.up.isDown && player.touchingGround){
        player.setVelocityY(-jump);
    }

    if(pauzeKey.isDown){
        if(Date.now()-lastPauzeTime>300){ // DEBOUNCING
            lastPauzeTime = Date.now();
            let tempY = player.body.velocity.y;
            player.setVelocityY(previousYSpeed);
            previousYSpeed = tempY;
            player.body.allowGravity = !player.body.allowGravity;
            pauzed = !pauzed;
        }
    }

    if(redKey.isDown){
        turnRed();
    }

    if(greenKey.isDown){
        turnGreen();
    }

    if(blueKey.isDown){
        turnBlue();
    }

    player.touchingGround = false;
}

function paneContact(player, pane) {
    if(player.color === pane.color){
        player.x -= gameSpeed/2;
    }
}

function groundContact(player, ground) {
    player.touchingGround = true;
    player.setVelocityY(0);
    player.setGravityY(-gravity);
}

function moveBackground() {
    background.x -= gameSpeed;
}

function moveObjects() {
    panes.forEach(function (pane) {
        pane.x -= gameSpeed;
    })
}

function turnNeutral(){
    const color = player.color;
    const anim = color+"ToNeutral";
    player.anims.play(anim);
}
function turnRed(){
    turnNeutral();
    setTimeout(function(){
        player.anims.play("neutralToRed");
        player.color = "red";
    },300);
}
function turnGreen(){
    turnNeutral();
    setTimeout(function(){
        player.anims.play("neutralToGreen");
        player.color = "green";
    },300);
}
function turnBlue(){
    turnNeutral();
    setTimeout(function(){
        player.anims.play("neutralToBlue");
        player.color = "blue";
    },300);
}

function kill(object) {
    object.disableBody(true,true);
    object = null;
}

function destroyAll() {

}

function winGame(){

}