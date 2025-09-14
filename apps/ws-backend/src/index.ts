import { JWT_TOKEN } from '@repo/common';
import { WebSocket, WebSocketServer } from 'ws';
import jwt  from 'jsonwebtoken';
import { prismaClient } from '@repo/db';

const wss = new WebSocketServer({ port: 8080 });

interface User {
  rooms: string[],
  ws: WebSocket
}

type ClientMessage = {type: "join-room", slug: string} | {type: "leave-room", slug: string} | {type: "chat-room", slug: string, message: string}

let users = new Map<string, User>();

function verifyUser (token: string) {
  try {
    const decoded = jwt.verify(token, JWT_TOKEN)
    if(decoded !== null){
      if(typeof decoded == 'object' && 'id' in decoded){
        return (decoded as jwt.JwtPayload).id as string;
      }else{
        return null
      }
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

function verifyData(data: any): data is ClientMessage {
  if (typeof data !== "object" || data === null || !("type" in data)) return false;
  switch (data.type) {
    case "join-room":
    case "leave-room":
      return "roomId" in data && typeof data.roomId === "number";
    case "chat-room":
      return "roomId" in data && typeof data.roomId === "number"
          && "message" in data && typeof data.message === "string";
    default:
      return false;
  }
}


wss.on('connection', function connection(ws, request) {

  const url = request.url
  if(url == null){
    ws.send("no url")
    return;
  }
  const queryParams = new URLSearchParams(url.split('?')[1])
  const token = queryParams.get('token') || ""
  if(token === ""){
    ws.close(1008,"No token sent!")
    return
  }
  const userId = verifyUser(token)

  if(userId == null){
    ws.close(1008, "Invalid token!")
    return
  }
  if(!users.has(userId)){
    users.set(userId, {
      rooms: [],
      ws: ws
    })
  }else{
    return
  }

  ws.on('message', async function message(data) {
    const parsedData = JSON.parse(data.toString())
    const user = users.get(userId)
    if(!verifyData(parsedData)){
      ws.send(JSON.stringify({ type: "error", message: "Wrong input" }));
      return
    }
    switch (parsedData.type) {
      case "join-room":
        const room = await prismaClient.room.findFirst({
          where: {
            slug: parsedData.slug
          }
        })
        console.log(room)
        if(room){
          user!.rooms.push(parsedData.slug)
          ws.send("Joined the room")
        }else{
          ws.send("This room doesn't exist!")
        }
        break;
      case "leave-room":
        if(user!.rooms.includes(parsedData.slug)){
          user!.rooms = user!.rooms.filter(room => room !== parsedData.slug)
          ws.send("Left the room")
        }else{
          ws.send("You're not subbed to this room")
        }
        break;
      case "chat-room":
        if(user!.rooms.includes(parsedData.slug)){
          const room = await prismaClient.room.findFirst({
            where: {
              slug: parsedData.slug
            }
          })
          if(!room){
            ws.send("Invalid slug sent!")
            return
          }
          const chat = await prismaClient.chat.create({
            data: {
              message: parsedData.message,
              roomId: room?.id,
              userId: userId
            }
          })
          users.forEach((user)=>{
            if(user.rooms.includes(parsedData.slug) && user.ws !== ws){
              const messageObject = {
                user: userId,
                message: parsedData.message
              }
              user.ws.send(JSON.stringify(messageObject))
            }
          })
          break;
        }else{
          ws.send("You are not subbed to the room")
        }
        break;
      default:
        break;
    }
  });
});