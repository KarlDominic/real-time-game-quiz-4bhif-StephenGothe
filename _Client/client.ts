declare const io: SocketIOStatic;

import {player,enemys, killEnemy} from './game';
import { enemy } from './enemy';

var id:number;

const socket = io();


joinServer();

socket.on('join', function(message:number) {
  console.log(`Received: ${message}`);
  id = message;
});

socket.on('cor', function(data) {

  let isID:boolean = false;

  for(let i:number = 0; i < enemys.length; i++)
  {
    if(enemys[i].id == data.id && enemys[i].char != null)
    {
      enemys[i].char.x = data.x;
      enemys[i].char.y = data.y;
      isID = true;
    }
  }

  if(isID == false)
  {
    let newPlayer: enemy = new enemy();
    newPlayer.id = data.id;
    newPlayer.char = null;
  
    enemys.push(newPlayer);
  }
});

socket.on('left', function(message:number) {

  console.log("Player " + message + ". left!");

  for(let i:number = 0; i < enemys.length; i++)
  {
    if(enemys[i].id == message)
    {
      enemys[i].char.kill();
      enemys[i].char.destroy(true);

      //enemys.splice(i);
    }   
  }
});

function joinServer()
{
  socket.emit('join', '');
}

export function sendCoor()
{
    socket.emit('cor', {"id": id, "x": player.x, "y": player.y});
}