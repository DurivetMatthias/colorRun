let background;
let player;
let enemies = [];
let ground = [];
let cursors;
let camera;
let panes = {red:[], green:[], blue:[], yellow:[]};
let outerThis;
let pauzed = false;
let pauzeKey;
let redKey;
let greenKey;
let blueKey;
let yellowKey;
let lastPauzeTime = Date.now();
let time = 0;
let timerTextField;
let endScenePlaying = false;
let music;

const width = 1600;
const height = 700;
const maxPlayerPosition = width/3;
const bounce = 0.1;
const gravity = 1000;
const theoreticalFramesPerSecond = 60;
const groundY = height*9/10;
const jump = 900;
const widthMultiplier = 50;
const gameSpeed = 300; //pixels per frame
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
    this.load.image('background', 'assets/space.jpg');
    this.load.image('red', 'assets/red.png');
    this.load.image('green', 'assets/green.png');
    this.load.image('blue', 'assets/blue.png');
    this.load.image('yellow', 'assets/yellow.png');
    this.load.image('endScene', 'assets/mirai_nikki.png');
    this.load.image('shadow', 'assets/shadow.png');
    this.load.audio('nyan', 'assets/nyancat.mp3');

    let spriteHeight = 75;
    let spriteWidth = 101;

    this.load.spritesheet('RTN', 'assets/red/Caelenberghe_Transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('GTN', 'assets/green/Standaert_Transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('BTN', 'assets/blue/Durivet_Transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('YTN', 'assets/yellow/Bruynooghe_Transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });

    this.load.spritesheet('NTR', 'assets/red/Caelenberghe_Reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('NTG', 'assets/green/Standaert_Reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('NTB', 'assets/blue/Durivet_Reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('NTY', 'assets/yellow/Bruynooghe_Reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });

    this.load.spritesheet('RR', 'assets/red/Caelenberghe_Run.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('GR', 'assets/green/Standaert_Run.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('BR', 'assets/blue/Durivet_Run.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('YR', 'assets/yellow/Bruynooghe_Run.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });

    this.load.spritesheet('RJ', 'assets/red/Caelenberghe_Jump.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('GJ', 'assets/green/Standaert_Jump.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('BJ', 'assets/blue/Durivet_Jump.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('YJ', 'assets/yellow/Bruynooghe_Jump.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });

    this.load.spritesheet('shadows', 'assets/shadow.png', { frameWidth: 200, frameHeight: 200 });
    this.load.spritesheet('nyancat', 'assets/nyancat.png', { frameWidth: 212, frameHeight: 77 });
    this.load.spritesheet('rainbow', 'assets/rainbow.png', { frameWidth: 200, frameHeight: 77 });
}

function create ()
{
    outerThis = this;
    let musicPromise = new Promise(function (resolve) {
        music = outerThis.sound.add('nyan');
        resolve();
    });

    musicPromise.then(function () {
        music.volume = 0.05;
        music.play();
    }).catch(function () {
        console.log(music, "oops");
    });

    background = this.add.tileSprite(0, 0, width*widthMultiplier*100, height, "background").setOrigin(0,0);
    cursors = this.input.keyboard.createCursorKeys();

    //ANIMATION STUFF

    this.anims.create({
        key: 'rainbowAnim',
        frames: this.anims.generateFrameNumbers('rainbow'),
        frameRate: 7,
        repeat: -1
    });

    this.anims.create({
        key: 'nyancatAnim',
        frames: this.anims.generateFrameNumbers('nyancat'),
        frameRate: 7,
        repeat: -1
    });

    this.anims.create({
        key: 'shadowAnim',
        frames: this.anims.generateFrameNumbers('shadows'),
        frameRate: 10,
        repeat: -1
    });

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

    for(let i = 0; i<10*widthMultiplier; i++){
        let x = Math.floor(Math.random() * width*widthMultiplier)+ width;
        //let y = height - 230;
        let y = groundY - Math.floor(Math.random() * height/4) - 80  ;
        /*let paneWidth = Math.floor(Math.random() * width/50) + width/50;
        let paneHeight = Math.floor(Math.random() * height/50)+ height/50;*/
        let paneWidth = 80;
        let paneHeight = 80;
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

    player = this.physics.add.sprite(maxPlayerPosition, groundY/2, "RR");
    player.setBounce(bounce);
    player.isDead = false;
    player.body.setGravityY(gravity);
    player.color = "red";
    player.setAccelerationX(gameSpeed);
    player.setVelocityX(gameSpeed);
    player.setMaxVelocity(gameSpeed,1000);
    player.setMass(2);
    player.transforming = false;

    let rainbowWidth = 200;
    for(let i = 0;i<Math.floor(width/rainbowWidth);i++){
        let temp;
        if(i === 0){
            temp = this.physics.add.sprite(width*9/10 - (rainbowWidth*i), height, "ground").setOrigin(1,1).setGravityY(-gravity).play("nyancatAnim");
        }else{
            temp = this.physics.add.sprite(width*9/10 - (rainbowWidth*i), height, "ground").setOrigin(1,1).setGravityY(-gravity).play("rainbowAnim");
        }
        temp.setImmovable(true);
        ground.push(temp);
    }

    for(let i = 0; i<Math.ceil(height/200);i++) {
        let temp = this.physics.add.sprite(100, i * 200, "shadow");
        temp.anims.play("shadowAnim");
        temp.body.width = 20;
        temp.setGravityY(-gravity);
        enemies.push(temp);
    }

    pauzeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    redKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    greenKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    blueKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    yellowKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);

    this.physics.add.overlap(player,enemies,onEnemyCollision,null,this);
    ground.forEach(g => outerThis.physics.add.collider(player, g));
    colliders.red = this.physics.add.collider(player, panes.red);
    colliders.green = this.physics.add.collider(player, panes.green);
    colliders.blue = this.physics.add.collider(player, panes.blue);
    colliders.yellow = this.physics.add.collider(player, panes.yellow);

    colliders.green.active = false;
    colliders.blue.active = false;
    colliders.yellow.active = false;

    timerTextField = this.add.text(width/2, height/10, getGameTime(), { backgroundColor: '#888888', color: '#000000', font: '18pt Arial' }).setPadding(32, 16).setOrigin(0.5,0.5).setScrollFactor(0);
    timerTextField.z = 10;

    let random = Math.floor(Math.random() * 4);
    turn(colorArray[random]);

    //CAMERA STUFF
    camera = this.cameras.main.setSize(width, height);
    this.cameras.main.setBounds(0, 0, width*widthMultiplier, height);
    this.cameras.main.startFollow(player);
}

function update ()
{
    if(player.isDead){
        if(!endScenePlaying) {
            playEndCutscene();
            pauzed = true;
            pauzeAll();
            player.x = -500
        }
    }else{


        if(!pauzed){
            moveBackground();
            time++;
            timerTextField.setText(getGameTime());
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
                pauzed = !pauzed;
                if(pauzed) pauzeAll();
                else unpauzeAll();
            }
        }

        if(!player.transforming){
            if(redKey.isDown&&player.color!="red"){
                turn("red");
            }

            if(greenKey.isDown&&player.color!="green"){
                turn("green");
            }

            if(blueKey.isDown&&player.color!="blue"){
                turn("blue");
            }

            if(yellowKey.isDown&&player.color!="yellow"){
                turn("yellow");
            }
        }
    }
}

function setPaneVelocity(amount) {
    panes.red.forEach(p => p.setVelocityX(amount));
    panes.green.forEach(p => p.setVelocityX(amount));
    panes.blue.forEach(p => p.setVelocityX(amount));
    panes.yellow.forEach(p => p.setVelocityX(amount));
}

function moveBackground() {
    background.x -= gameSpeed/theoreticalFramesPerSecond;
}

function turnNeutral(){
    player.anims.play(player.color + "ToNeutral",true);
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
function getGameTime(){
    let timeInSeconds = Math.floor(time/theoreticalFramesPerSecond);
    if(timeInSeconds/60 <10){
        if(timeInSeconds % 60 < 10){
            return `0${Math.floor(timeInSeconds/60)} : 0${timeInSeconds % 60}`;
        }else{
            return `0${Math.floor(timeInSeconds/60)} : ${timeInSeconds % 60}`;
        }
    }else{
        if(timeInSeconds % 60 < 10){
            return `${Math.floor(timeInSeconds/60)} : 0${timeInSeconds % 60}`;
        }else{
            return `${Math.floor(timeInSeconds/60)} : ${timeInSeconds % 60}`;
        }

    }
}
function onEnemyCollision(player) {
    player.isDead = true;
}
function playEndCutscene() {
    camera.flash(1000);
    endScenePlaying = true;
    outerThis.add.image(0,0,'endScene').setOrigin(0).setDisplaySize(width, height).setScrollFactor(0);
}
function pauzeAll() {
    player.anims.stop();
    player.setVelocityX(0);
    player.setAccelerationX(0);
    player.setVelocityY(0);
    player.body.allowGravity = false;
    enemies.forEach(e => e.anims.stop());
    ground.forEach(g => g.anims.stop());
    setPaneVelocity(0);
}
function unpauzeAll() {
    player.anims.resume();
    player.setVelocityX(gameSpeed);
    player.setAccelerationX(gameSpeed);
    player.setVelocityY(gameSpeed);
    player.body.allowGravity = true;
    enemies.forEach(e => e.anims.restart());
    ground.forEach(g => g.anims.restart());
    setPaneVelocity(-gameSpeed);
}