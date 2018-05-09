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
const maxPlayerPosition = width/2;
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
    this.load.image('red', 'assets/red.png');
    this.load.image('green', 'assets/green.png');
    this.load.image('blue', 'assets/blue.png');
    this.load.image('yellow', 'assets/yellow.png');

    this.load.spritesheet('RTN', 'assets/red/Caelenberghe_Transform.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('GTN', 'assets/green/Standaert_Transform.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('BTN', 'assets/blue/Durivet_Transform.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('YTN', 'assets/yellow/Bruynooghe_Transform.png', { frameWidth: 100, frameHeight: 100 });

    this.load.spritesheet('NTR', 'assets/red/Caelenberghe_Reverse.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('NTG', 'assets/green/Standaert_Reverse.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('NTB', 'assets/blue/Durivet_Reverse.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('NTY', 'assets/yellow/Bruynooghe_Reverse.png', { frameWidth: 100, frameHeight: 100 });

    this.load.spritesheet('RR', 'assets/red/Caelenberghe_Run.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('GR', 'assets/green/Standaert_Run.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('BR', 'assets/blue/Durivet_Run.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('YR', 'assets/yellow/Bruynooghe_Run.png', { frameWidth: 100, frameHeight: 100 });

    this.load.spritesheet('RJ', 'assets/red/Caelenberghe_Jump.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('GJ', 'assets/green/Standaert_Jump.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('BJ', 'assets/blue/Durivet_Jump.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('YJ', 'assets/yellow/Bruynooghe_Jump.png', { frameWidth: 100, frameHeight: 100 });
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
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'greenToNeutral',
        frames: this.anims.generateFrameNumbers('GTN'),
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'blueToNeutral',
        frames: this.anims.generateFrameNumbers('BTN'),
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'yellowToNeutral',
        frames: this.anims.generateFrameNumbers('YTN'),
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'neutralTored',
        frames: this.anims.generateFrameNumbers('NTR'),
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'neutralTogreen',
        frames: this.anims.generateFrameNumbers('NTG'),
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'neutralToblue',
        frames: this.anims.generateFrameNumbers('NTB'),
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'neutralToyellow',
        frames: this.anims.generateFrameNumbers('NTY'),
        frameRate: 10,
        repeat: false
    });

    this.anims.create({
        key: 'redRun',
        frames: this.anims.generateFrameNumbers('RR'),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'redJump',
        frames: this.anims.generateFrameNumbers('RJ'),
        frameRate: 5,
        repeat: false
    });

    this.anims.create({
        key: 'greenRun',
        frames: this.anims.generateFrameNumbers('GR'),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'greenJump',
        frames: this.anims.generateFrameNumbers('GJ'),
        frameRate: 5,
        repeat: false
    });

    this.anims.create({
        key: 'blueRun',
        frames: this.anims.generateFrameNumbers('BR'),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'blueJump',
        frames: this.anims.generateFrameNumbers('BJ'),
        frameRate: 5,
        repeat: false
    });

    this.anims.create({
        key: 'yellowRun',
        frames: this.anims.generateFrameNumbers('YR'),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'yellowJump',
        frames: this.anims.generateFrameNumbers('YJ'),
        frameRate: 5,
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
        //pane.setImmovable();
        pane.width = paneWidth;
        pane.height = paneHeight;
        pane.color = color;
        //pane.setBlendMode(Phaser.BlendModes.DIFFERENCE);
        pane.setVelocityX(-gameSpeed);
        pane.setMass(1000);
        pane.setMaxVelocity(gameSpeed, 0);
        panes[color].push(pane);
    }

    player = this.physics.add.sprite(maxPlayerPosition, groundY, "RR");
    player.setBounce(bounce);
    player.isDead = false;
    player.body.setGravityY(gravity);
    player.color = "red";
    player.setAccelerationX(gameSpeed/2);
    player.setVelocityX(gameSpeed);
    player.setMaxVelocity(gameSpeed,1000);
    player.setMass(2);
    player.transforming = false;

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


    let random = Math.floor(Math.random() * 4);
    turn(colorArray[random]);

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

    if (player.body.touching.down&&!player.transforming){
        player.anims.play(player.color+"Run",true);
    }

    if (cursors.up.isDown&&player.body.touching.down){
        player.setVelocityY(-jump);
        player.anims.play(player.color+"Jump",true);
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
        turn("red");
    }

    if(greenKey.isDown){
        turn("green");
    }

    if(blueKey.isDown){
        turn("blue");
    }

    if(yellowKey.isDown){
        turn("yellow");
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
function turn(color){
    player.transforming = true;

    turnNeutral();
    setTimeout(function () {
        colliders[color].active = true;
    },200);

    setTimeout(function () {
        player.anims.play("neutralTo"+color,true);
        player.color = color;
    },400);

    setTimeout(function () {
        player.transforming = false;
    },800);
}