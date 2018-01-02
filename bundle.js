(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
const enemy_1 = require("./enemy");
var id;
const socket = io();
joinServer();
socket.on('join', function (message) {
    console.log(`Received: ${message}`);
    id = message;
});
socket.on('cor', function (data) {
    let isID = false;
    for (let i = 0; i < game_1.enemys.length; i++) {
        if (game_1.enemys[i].id == data.id && game_1.enemys[i].char != null) {
            game_1.enemys[i].char.x = data.x;
            game_1.enemys[i].char.y = data.y;
            isID = true;
        }
    }
    if (isID == false) {
        let newPlayer = new enemy_1.enemy();
        newPlayer.id = data.id;
        newPlayer.char = null;
        game_1.enemys.push(newPlayer);
    }
});
socket.on('death', function (data) {
    if (data.victom == id) {
        game_1.player.kill();
    }
    else {
        for (let i = 0; i < game_1.enemys.length; i++) {
            if (game_1.enemys[i].id == data.victom) {
                game_1.enemys[i].char.kill();
            }
        }
    }
});
socket.on('revive', function (message) {
    for (let i = 0; i < game_1.enemys.length; i++) {
        if (game_1.enemys[i].id == message) {
            game_1.enemys[i].char.revive();
        }
    }
});
socket.on('left', function (message) {
    console.log("Player " + message + ". left!");
    for (let i = 0; i < game_1.enemys.length; i++) {
        if (game_1.enemys[i].id == message) {
            game_1.enemys[i].char.kill();
            game_1.enemys[i].char.destroy(true);
            //enemys.splice(i);
        }
    }
});
function joinServer() {
    socket.emit('join', '');
}
function sendDeath() {
    for (let i = 0; i < game_1.enemys.length; i++) {
        if (game_1.enemys[i].char != null && game_1.enemys[i].char.health == 0) {
            game_1.enemys[i].char.kill();
            socket.emit('death', { "killer": id, "victom": game_1.enemys[i].id });
            game_1.enemys[i].char.health = 1;
        }
    }
}
exports.sendDeath = sendDeath;
function sendRevive() {
    socket.emit('revive', id);
}
exports.sendRevive = sendRevive;
function sendCoor() {
    socket.emit('cor', { "id": id, "x": game_1.player.x, "y": game_1.player.y });
}
exports.sendCoor = sendCoor;

},{"./enemy":2,"./game":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class enemy {
}
exports.enemy = enemy;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
exports.enemys = new Array();
var btn = document.getElementById("revive");
btn.onclick = function () { PlayerRevive(); };
var game;
var map;
var layer;
const playerSpeed = 200;
const playerJump = 400;
const playerGravity = 900;
var canJump;
var onWall;
var enemysGroup;
class JaRGame {
    constructor() {
        game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
    }
    preload() {
        game.stage.backgroundColor = 0x444444;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        // loading level tilemap
        game.load.tilemap("level", '_Client/level.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image("tile", "img/tile.png");
        game.load.image("player", "img/player.png");
        game.load.image("enemy", "img/enemy.png");
    }
    create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        map = game.add.tilemap("level");
        map.addTilesetImage("tileset01", "tile");
        map.setCollision(1);
        layer = map.createLayer("layer01");
        exports.player = game.add.sprite(game.width / 2, 440, "player");
        exports.player.anchor.set(0.5);
        game.physics.enable(exports.player, Phaser.Physics.ARCADE);
        exports.player.body.gravity.y = playerGravity;
        exports.player.body.velocity.x = playerSpeed;
        canJump = true;
        onWall = false;
        enemysGroup = game.add.group();
        enemysGroup.enableBody = true;
        enemysGroup.physicsBodyType = Phaser.Physics.ARCADE;
        game.input.onDown.add(JaRGame.prototype.handleJump);
    }
    update() {
        // handling collision between the hero and the tiles
        game.physics.arcade.collide(exports.player, layer, function (player, layer) {
            // hero on the ground
            if (player.body.blocked.down) {
                // hero can jump
                canJump = true;
                // hero not on the wall
                onWall = false;
            }
            // hero on the ground and touching a wall on the right
            if (player.body.blocked.right && player.body.blocked.down) {
                // horizontal flipping hero sprite
                player.scale.x = -1;
            }
            // hero NOT on the ground and touching a wall on the right
            if (player.body.blocked.right && !player.body.blocked.down) {
                // hero on a wall
                onWall = true;
            }
            // same concept applies to the left
            if (player.body.blocked.left && player.body.blocked.down) {
                player.scale.x = 1;
            }
            if (player.body.blocked.left && !player.body.blocked.down) {
                onWall = true;
            }
            // adjusting hero speed according to the direction it's moving
            player.body.velocity.x = playerSpeed * player.scale.x;
        }, null, this);
        game.physics.arcade.collide(exports.player, enemysGroup, function (player, enemy) {
            if (enemy.body.touching.up && player.body.touching.down) {
                enemy.health = 0;
            }
            else if (enemy.body.touching.right && player.body.touching.left) {
                player.scale.x = 1;
            }
            else if (enemy.body.touching.left && player.body.touching.right) {
                player.scale.x = -1;
            }
        }, null, this);
        client_1.sendCoor();
        client_1.sendDeath();
        //new Enemy
        for (let i = 0; i < exports.enemys.length; i++) {
            if (exports.enemys[i].char == null) {
                exports.enemys[i].char = enemysGroup.create(game.width / 2, 440, "enemy");
                exports.enemys[i].char.anchor.set(0.5);
            }
        }
    }
    handleJump(event) {
        if ((canJump && exports.player.body.blocked.down) || onWall) {
            // applying jump force
            exports.player.body.velocity.y = -playerJump;
            // is the hero on a wall?
            if (onWall) {
                // flip horizontally the hero
                exports.player.scale.x *= -1;
                // change the horizontal velocity too. This way the hero will jump off the wall
                exports.player.body.velocity.x = playerSpeed * exports.player.scale.x;
            }
            // hero can't jump anymore
            canJump = false;
            // hero is not on the wall anymore
            onWall = false;
        }
    }
}
function PlayerRevive() {
    exports.player.revive();
    client_1.sendRevive();
}
window.onload = () => {
    var game = new JaRGame();
};

},{"./client":1}]},{},[1]);
