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
const initialColor = "red";

let startScene;
let startText;
let restartScene;
let restartText;
let background;
let player;
let enemies = [];
let ground = [];
let cursors;
let camera;
let panes = {red:[], green:[], blue:[], yellow:[]};
let outerThis;
let pauzed = true;
let pauzeKey;
let redKey;
let greenKey;
let blueKey;
let yellowKey;
let lastPauzeTime = Date.now();
let time = 0;
let timerTextField;
let endScenePlaying = false;
let endScene;
let music;
let startScenePlaying = false;

let actionObject = {jump: false, color: initialColor, pauze: false};
const socket = io();

socket.on("order",function(data){
    //console.log(data);
    switch (data) {
        case "p":
            actionObject.pauze = true;
            break;
        case "j":
            actionObject.jump = true;
            break;
        default:
            actionObject.color = data;
    }
    //order = data;
});

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
    let loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width/2 - 160, height/2, 320, 50);

    var percentText = this.make.text({
        x: width / 2,
        y: height / 2 + 25,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(width/2 + 10 - 160, height/2 + 10, 300 * value, 30);
    });

    this.load.on('fileprogress', function (file) {
        console.log(file.src);
    });

    this.load.on('complete', function () {

        percentText.destroy();
        loadingText.destroy();
        progressBar.destroy();
        progressBox.destroy();
    });

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

    this.load.spritesheet('RTN', 'assets/red/transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('GTN', 'assets/green/transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('BTN', 'assets/blue/transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('YTN', 'assets/yellow/transform.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });

    this.load.spritesheet('NTR', 'assets/red/reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('NTG', 'assets/green/reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('NTB', 'assets/blue/reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });
    this.load.spritesheet('NTY', 'assets/yellow/reverse.png', { frameWidth: spriteWidth, frameHeight: spriteHeight });

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

    outerThis = this;
}

function create ()
{
    function loadMusic() {
        return new Promise(function (resolve) {
            music = outerThis.sound.add('nyan');
            music.play();
            resolve();
        });
    }
    loadMusic();

    background = outerThis.add.tileSprite(0, 0, width*widthMultiplier*100, height, "background").setOrigin(0,0);
    cursors = outerThis.input.keyboard.createCursorKeys();

    //ANIMATION STUFF

    outerThis.anims.create({
        key: 'rainbowAnim',
        frames: outerThis.anims.generateFrameNumbers('rainbow'),
        frameRate: 7,
        repeat: -1
    });

    outerThis.anims.create({
        key: 'nyancatAnim',
        frames: outerThis.anims.generateFrameNumbers('nyancat'),
        frameRate: 7,
        repeat: -1
    });

    outerThis.anims.create({
        key: 'shadowAnim',
        frames: outerThis.anims.generateFrameNumbers('shadows'),
        frameRate: 10,
        repeat: -1
    });

    outerThis.anims.create({
        key: 'redToNeutral',
        frames: outerThis.anims.generateFrameNumbers('RTN'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'greenToNeutral',
        frames: outerThis.anims.generateFrameNumbers('GTN'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'blueToNeutral',
        frames: outerThis.anims.generateFrameNumbers('BTN'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'yellowToNeutral',
        frames: outerThis.anims.generateFrameNumbers('YTN'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'neutralTored',
        frames: outerThis.anims.generateFrameNumbers('NTR'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'neutralTogreen',
        frames: outerThis.anims.generateFrameNumbers('NTG'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'neutralToblue',
        frames: outerThis.anims.generateFrameNumbers('NTB'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'neutralToyellow',
        frames: outerThis.anims.generateFrameNumbers('NTY'),
        frameRate: 10,
        repeat: false
    });

    outerThis.anims.create({
        key: 'redRun',
        frames: outerThis.anims.generateFrameNumbers('RR'),
        frameRate: 5,
        repeat: -1
    });

    outerThis.anims.create({
        key: 'redJump',
        frames: outerThis.anims.generateFrameNumbers('RJ'),
        frameRate: 5,
        repeat: false
    });

    outerThis.anims.create({
        key: 'greenRun',
        frames: outerThis.anims.generateFrameNumbers('GR'),
        frameRate: 5,
        repeat: -1
    });

    outerThis.anims.create({
        key: 'greenJump',
        frames: outerThis.anims.generateFrameNumbers('GJ'),
        frameRate: 5,
        repeat: false
    });

    outerThis.anims.create({
        key: 'blueRun',
        frames: outerThis.anims.generateFrameNumbers('BR'),
        frameRate: 5,
        repeat: -1
    });

    outerThis.anims.create({
        key: 'blueJump',
        frames: outerThis.anims.generateFrameNumbers('BJ'),
        frameRate: 5,
        repeat: false
    });

    outerThis.anims.create({
        key: 'yellowRun',
        frames: outerThis.anims.generateFrameNumbers('YR'),
        frameRate: 5,
        repeat: -1
    });

    outerThis.anims.create({
        key: 'yellowJump',
        frames: outerThis.anims.generateFrameNumbers('YJ'),
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

    player = outerThis.physics.add.sprite(maxPlayerPosition, groundY/2, "RR");
    player.setBounce(bounce);
    player.isDead = false;
    player.body.setGravityY(gravity);
    player.color = initialColor;
    player.setAccelerationX(gameSpeed);
    player.setVelocityX(gameSpeed);
    player.setMaxVelocity(gameSpeed,1000);
    player.setMass(2);
    player.transforming = false;

    let rainbowWidth = 200;
    for(let i = 0;i<Math.floor(width/rainbowWidth);i++){
        let temp;
        if(i === 0){
            temp = outerThis.physics.add.sprite(width*9/10 - (rainbowWidth*i), height, "ground").setOrigin(1,1).setGravityY(-gravity).play("nyancatAnim");
        }else{
            temp = outerThis.physics.add.sprite(width*9/10 - (rainbowWidth*i), height, "ground").setOrigin(1,1).setGravityY(-gravity).play("rainbowAnim");
        }
        temp.setImmovable(true);
        ground.push(temp);
    }

    for(let i = 0; i<Math.ceil(height/200);i++) {
        let temp = outerThis.physics.add.sprite(100, i * 200, "shadow");
        temp.anims.play("shadowAnim");
        temp.body.width = 20;
        temp.setGravityY(-gravity);
        enemies.push(temp);
    }

    pauzeKey = outerThis.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    redKey = outerThis.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    greenKey = outerThis.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    blueKey = outerThis.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    yellowKey = outerThis.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);

    outerThis.physics.add.overlap(player,enemies,onEnemyCollision,null,this);
    ground.forEach(g => outerThis.physics.add.collider(player, g));
    colliders.red = outerThis.physics.add.collider(player, panes.red);
    colliders.green = outerThis.physics.add.collider(player, panes.green);
    colliders.blue = outerThis.physics.add.collider(player, panes.blue);
    colliders.yellow = outerThis.physics.add.collider(player, panes.yellow);

    colliders.green.active = false;
    colliders.blue.active = false;
    colliders.yellow.active = false;

    timerTextField = outerThis.add.text(width/2, height/10, getGameTime(), { backgroundColor: '#888888', color: '#000000', font: '18pt Arial' }).setPadding(32, 16).setOrigin(0.5,0.5).setScrollFactor(0);
    timerTextField.setDepth(2);

    turn(initialColor);

    socket.emit("S");

    pauzeAll();
    playStartScene();

    //CAMERA STUFF
    camera = outerThis.cameras.main.setSize(width, height);
    outerThis.cameras.main.setBounds(0, 0, width*widthMultiplier, height);
    outerThis.cameras.main.startFollow(player);
}

function update ()
{
    if (player.body.touching.down && !player.transforming) {
        player.anims.play(player.color + "Run", true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        actionObject.jump = true;
    }

    if (pauzeKey.isDown) {
        actionObject.pauze = true;
    }

    if (redKey.isDown) {
        actionObject.color = "red";
    }

    if (greenKey.isDown) {
        actionObject.color = "green";
    }

    if (blueKey.isDown) {
        actionObject.color = "blue";
    }

    if (yellowKey.isDown) {
        actionObject.color = "yellow";
    }

    if(player.isDead){
        if(!endScenePlaying) {
            socket.emit("L");
            playEndCutscene();
            pauzed = true;
            pauzeAll();
            player.x = -500
        }
        if(actionObject.pauze){
            actionObject.pauze = false;
            restartGame();
        }
    }else{
        if (actionObject.pauze) {
            pauzeGame();
            actionObject.pauze = false;
        }

        if(!pauzed) {
            moveBackground();
            time++;
            timerTextField.setText(getGameTime());

            if (player.x > maxPlayerPosition) {
                player.x = maxPlayerPosition;
            }

            if (actionObject.jump) {
                jumpUp();
                actionObject.jump = false;
            }

            if (actionObject.color !== player.color) {
                turn(actionObject.color);
            }
        }
    }
}

function jumpUp()
{
    if (player.body.touching.down){
        player.setVelocityY(-jump);
        player.anims.play(player.color+"Jump",true);
    }
}

function restartGame() {
    location.reload();
}

function pauzeGame()
{
    if(startScenePlaying)endStartScene();

    if(Date.now()-lastPauzeTime>300){ // DEBOUNCING
        lastPauzeTime = Date.now();
        pauzed = !pauzed;
        if(pauzed) pauzeAll();
        else unpauzeAll();
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
    endScene = outerThis.add.image(0,0,'endScene').setOrigin(0).setDisplaySize(width, height).setScrollFactor(0).setDepth(1);
    setTimeout(function () {
        restartText = outerThis.make.text({
            x: width / 2,
            y: height / 2 + 25,
            text: 'Press the button to restart',
            style: {
                font: '30px monospace',
                fill: '#ffffff'
            }
        });
        restartText.setDepth(3);
        restartText.setOrigin(.5,.5);

        restartScene = outerThis.add.graphics();

        restartScene.fillStyle(0x000000);
        restartScene.fillRect(width/4,height/4, width/2, height/2);
        restartScene.setDepth(2);
    },2000)
}
function playStartScene() {
    startScenePlaying = true;
    startText = outerThis.make.text({
        x: width / 2,
        y: height / 2 + 25,
        text: 'Press the button to start the game',
        style: {
            font: '30px monospace',
            fill: '#ffffff'
        }
    });
    startText.setDepth(2);
    startText.setOrigin(.5,.5);

    startScene = outerThis.add.graphics();

    startScene.fillStyle(0x000000);
    startScene.fillRect(0,0, width, height);
    startScene.setDepth(1);
}
function endStartScene() {
    endScenePlaying = false;
    startText.destroy();
    startScene.destroy();
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