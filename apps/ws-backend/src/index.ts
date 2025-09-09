import { JWT_TOKEN } from '@repo/common';
import { WebSocketServer } from 'ws';
import jwt  from 'jsonwebtoken';

const wss = new WebSocketServer({ port: 8080 });

function verifyUser (token: string){
  if(token == null){
    return null
  }
  jwt.sign(token, JWT_TOKEN, (err: any, user: any)=>{
    if(err){
      return null
    }else{
      return user.userId
    }
  })
}

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
});