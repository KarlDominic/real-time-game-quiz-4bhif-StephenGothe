declare const io: SocketIOStatic;

import { player, enemys as enemies } from './game';
import { enemy } from './enemy';

var id: number;

const socket = io();


joinServer();

socket.on('join', function (message: number) {
  console.log(`Received: ${message}`);
  id = message;
});

socket.on('cor', function (data) {

  let isID: boolean = false;

  for (let i: number = 0; i < enemies.length; i++) {
    if (enemies[i].id == data.id && enemies[i].char != null) {
      enemies[i].char.x = data.x;
      enemies[i].char.y = data.y;
      isID = true;
    }
  }

  if (isID == false) {
    let newPlayer: enemy = new enemy();
    newPlayer.id = data.id;
    newPlayer.char = null;

    enemies.push(newPlayer);
  }
});

socket.on('death', function (data) {
  if (data.victom == id) {
    player.kill();
  }
  else {
    for (let i: number = 0; i < enemies.length; i++) {
      if (enemies[i].id == data.victom) {
        enemies[i].char.kill();
      }
    }
  }

});

socket.on('revive', function (message: number) {

    for (let i: number = 0; i < enemies.length; i++) {
      if (enemies[i].id == message) {
        enemies[i].char.revive();
      }
    }
});

socket.on('left', function (message: number) {

  console.log("Player " + message + ". left!");

  for (let i: number = 0; i < enemies.length; i++) {
    if (enemies[i].id == message) {
      enemies[i].char.kill();
      enemies[i].char.destroy(true);

      //enemys.splice(i);
    }
  }
});

function joinServer() {
  socket.emit('join', '');
}

export function sendDeath() {
  for (let i: number = 0; i < enemies.length; i++) {
    if (enemies[i].char != null && enemies[i].char.health == 0) {
      enemies[i].char.kill();
      socket.emit('death', { "killer": id, "victom": enemies[i].id });
      enemies[i].char.health = 1;
    }
  }
}

export function sendRevive()
{
  socket.emit('revive', id);
}

export function sendCoor() {
  socket.emit('cor', { "id": id, "x": player.x, "y": player.y });
}