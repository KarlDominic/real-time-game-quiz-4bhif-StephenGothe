import { Game, Tilemap, TilemapLayer, Sprite } from "phaser-ce";
import { sendCoor } from './client';
import { enemy } from "./enemy";

export var player: Sprite;
export var enemys: enemy[] = new Array();

var game: Game;
var map: Tilemap;
var layer: TilemapLayer;

const playerSpeed: number = 200;
const playerJump: number = 400;
const playerGravity: number = 900;

var canJump: boolean;
var onWall: boolean;

class JaRGame {

    constructor() {
        game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', { preload: this.preload, create: this.create, update: this.update });
    }

    game: Phaser.Game;

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

        player = game.add.sprite(game.width / 2, 440, "player");
        player.anchor.set(0.5);

        game.physics.enable(player, Phaser.Physics.ARCADE);

        player.body.gravity.y = playerGravity;

        player.body.velocity.x = playerSpeed;

        canJump = true;

        onWall = false;

        game.input.onDown.add(JaRGame.prototype.handleJump);
    }

    update() {

        // handling collision between the hero and the tiles
        game.physics.arcade.collide(player, layer, function (player, layer) {

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

        sendCoor();

        //new Enemy
        for (let i: number = 0; i < enemys.length; i++) {
            if (enemys[i].char == null) {
                enemys[i].char = game.add.sprite(game.width / 2, 440, "enemy");
                enemys[i].char.anchor.set(0.5);
            }
        }
    }

    handleJump(event: MouseEvent) {

        if ((canJump && player.body.blocked.down) || onWall) {

            // applying jump force
            player.body.velocity.y = -playerJump;

            // is the hero on a wall?
            if (onWall) {

                // flip horizontally the hero
                player.scale.x *= -1;

                // change the horizontal velocity too. This way the hero will jump off the wall
                player.body.velocity.x = playerSpeed * player.scale.x;
            }

            // hero can't jump anymore
            canJump = false;

            // hero is not on the wall anymore
            onWall = false;
        }
    }
}

window.onload = () => {

    var game = new JaRGame();
};
