let background;
let player;
let ground;
let cursors;
let camera;
let panes = {red:[], green:[], blue:[], yellow:[]};
let outerThis;
let gameEnded = false;
let previousYSpeed = 0;
let pauzed = false;
let pauzeKey;
let redKey;
let greenKey;
let blueKey;
let yellowKey;
let lastPauzeTime = Date.now();

const width = 1600;
const height = 700;
const maxPlayerPosition = width/3;
const bounce = 0.1;
const gravity = 1000;
const theoreticalFramesPerSecond = 60;
const groundY = height*7/10;
const jump = 900;
const widthMultiplier = 50;
const gameSpeed = 500; //pixels per frame
const colorArray = ['red','green','blue','yellow'];
const colliders = {red: null,green: null,blue: null,yellow: null};

const config = {
    type: Phaser.AUTO,
    width: width,
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
    this.load.image('yellow', 'assets/yellow.png');

    this.load.spritesheet('RTN', 'assets/redToNeutral.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('GTN', 'assets/greenToNeutral.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('BTN', 'assets/blueToNeutral.png', { frameWidth: 64, frameHeight: 64 });

    this.load.spritesheet('NTR', 'assets/neutralToRed.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('NTG', 'assets/neutralToGreen.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('NTB', 'assets/neutralToBlue.png', { frameWidth: 64, frameHeight: 64 });
}

function create ()
{
    outerThis = this;
    background = this.add.tileSprite(0, 0, width*widthMultiplier*100, height, "background").setOrigin(0,0);
    cursors = this.input.keyboard.createCursorKeys();

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

    for(let i = 0; i<20*widthMultiplier; i++){
        let x = Math.floor(Math.random() * width*widthMultiplier)+ width;
        let y = Math.floor(Math.random() * height/2)+ height/2 - height/50;
        /*let paneWidth = Math.floor(Math.random() * width/50) + width/50;
        let paneHeight = Math.floor(Math.random() * height/50)+ height/50;*/
        let paneWidth = 80;
        let paneHeight = 20;
        let colorIndex = Math.floor(Math.random() * 4);
        let color = colorArray[colorIndex];

        let pane = outerThis.physics.add.sprite(x,y, color).setOrigin(0,0).setGravityY(-gravity);
        pane.setDisplaySize(paneWidth,paneHeight);
        pane.setImmovable();
        pane.width = paneWidth;
        pane.height = paneHeight;
        //pane.body.immovable = true;
        pane.color = color;
        //pane.setBlendMode(Phaser.BlendModes.DIFFERENCE);
        pane.setVelocityX(-gameSpeed);
        pane.setMass(3);
        pane.setMaxVelocity(gameSpeed, 1000);
        panes[color].push(pane);
    }

    player = this.physics.add.sprite(maxPlayerPosition, groundY, "red");
    player.setBounce(bounce);
    player.isDead = false;
    player.body.setGravityY(gravity);
    player.height = 100;
    player.width = 100;
    player.setDisplaySize(100,100);
    player.color = "red";
    player.setAccelerationX(gameSpeed/2);
    player.setVelocityX(gameSpeed);
    player.setMaxVelocity(gameSpeed,1000);
    player.setMass(2);

    ground = this.physics.add.sprite(0, height*9/10, 'ground').setOrigin(0,0).setGravityY(-gravity);
    ground.width = width*widthMultiplier;
    ground.height = height/10;
    ground.setImmovable(true);
    ground.setDisplaySize(width*widthMultiplier, height/10);

    pauzeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    redKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    greenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    blueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    yellowKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);

    this.physics.add.collider(player, ground);
    colliders.red = this.physics.add.collider(player, panes.red);
    colliders.green = this.physics.add.collider(player, panes.green);
    colliders.blue = this.physics.add.collider(player, panes.blue);
    colliders.yellow = this.physics.add.collider(player, panes.yellow);

    colliders.green.active = false;
    colliders.blue.active = false;
    colliders.yellow.active = false;

    turnRed();

    //CAMERA STUFF
    camera = this.cameras.main.setSize(width, height);
    this.cameras.main.setBounds(0, 0, width*widthMultiplier, height);
    this.cameras.main.startFollow(player);
}

function update ()
{
    if(!pauzed){
        moveBackground();
    }

    if(player.x > maxPlayerPosition){
        player.x = maxPlayerPosition;
    }

    if (cursors.up.isDown&& player.body.touching.down){
        player.setVelocityY(-jump);
    }

    if(pauzeKey.isDown){
        if(Date.now()-lastPauzeTime>300){ // DEBOUNCING
            lastPauzeTime = Date.now();
            let tempY = player.body.velocity.y;
            player.setVelocityY(previousYSpeed);
            previousYSpeed = tempY;
            player.body.allowGravity = !player.body.allowGravity;
            if(!pauzed)setPaneVelocity(0);
            else setPaneVelocity(gameSpeed);
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

    if(yellowKey.isDown){
        turnYellow();
    }
}

function setPaneVelocity(amount) {
    panes.red.forEach(function (pane) {
        pane.setVelocityX(-amount);
    });
    panes.green.forEach(function (pane) {
        pane.setVelocityX(-amount);
    });
    panes.blue.forEach(function (pane) {
        pane.setVelocityX(-amount);
    });
    panes.yellow.forEach(function (pane) {
        pane.setVelocityX(-amount);
    });
}

function moveBackground() {
    background.x -= gameSpeed/theoreticalFramesPerSecond;
}

function turnNeutral(){
    player.anims.play(player.color + "ToNeutral");
    colliders.red.active = false;
    colliders.green.active = false;
    colliders.blue.active = false;
    colliders.yellow.active = false;
}
function turnRed(){
    turnNeutral();
    setTimeout(function(){
        player.anims.play("neutralToRed");
        player.color = "red";
        colliders.red.active = true;
    },300);
}
function turnGreen(){
    turnNeutral();
    setTimeout(function(){
        player.anims.play("neutralToGreen");
        player.color = "green";
        colliders.green.active = true;
    },300);
}
function turnBlue(){
    turnNeutral();
    setTimeout(function(){
        player.anims.play("neutralToBlue");
        player.color = "blue";
        colliders.blue.active = true;
    },300);
}
function turnYellow(){
    turnNeutral();
    setTimeout(function(){
        player.anims.play("neutralToBlue");
        player.color = "yellow";
        colliders.yellow.active = true;
    },300);
}