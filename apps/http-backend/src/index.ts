import express from "express"
import cors from "cors"
import {signUpSchema, signInSchema, roomSchema} from "@repo/validations"
import jwt from "jsonwebtoken"
import { JWT_TOKEN } from "@repo/common"
import { prismaClient } from "@repo/db"

interface AuthenticatedRequest extends express.Request{
    user?:{
        id: string,
        username: string
    }
}

const app = express();

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())

function authenticateToken (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction){
    const authHeaders = req.headers["authorization"]
    const token = authHeaders && authHeaders.split(' ')[1]

    if(!token){
        return res.status(400).json({
            message: "No token found!"
        })
    }else{
        jwt.verify(token, JWT_TOKEN, (err: any, user: any)=>{
            if(err){
                return res.status(403).json({
                    message:"Could not verify the jwt"
                })
            }else{
                req.user = user
                next()
            }
        })
    }
}

app.post("/signin", async (req,res)=>{
    if(signInSchema.safeParse(req.body).success){
        const {username, password} = req.body;

        const user = await prismaClient.user.findFirst({
            where: {
                username: username
            }
        })

        if(user === null){ //username doesn't exist in the db
            return res.status(400).json({
                message : `${username} doesn't exist`
            })
        }
        if(user.password !== password){//username and password doesn't match
            return res.status(400).json({
                message : "username and password doesn't match"
            })
        }

        const token = jwt.sign({
            id: user.id
        }, JWT_TOKEN)

        return res.status(200).json({
            message: "Login successful!",
            token: token
        })
    }else{
        return res.status(400).json({
            message: "Invalid Credentials"
        })
    }
})

app.post("/signup", async (req,res)=>{

    if(signUpSchema.safeParse(req.body).success){
        const {username, password, email} = req.body;

        const existingUser = await prismaClient.user.findFirst({
            where: {
                username: username
            }
        })

        if(existingUser){//username already exists
            return res.status(400).json({
                message : "username already exists!!"
            })
        }
        const newUser = await prismaClient.user.create({
            data: {
                username: username,
                password: password,
                email: email
            }
        })

        const token = jwt.sign({
            id: newUser.id
        }, JWT_TOKEN)

        return res.status(200).json({
            token: token,
            message : "Signup successful!"
        })
    }else{
        return res.status(400).json({
            message : "Invalid credentials!"
        })
    }
})

app.post("/create-room", authenticateToken, async (req: AuthenticatedRequest,res)=>{
    if(roomSchema.safeParse(req.body).success){
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated"
            });
        }
        const {slug} = req.body

        const existingRoom = await prismaClient.room.findFirst({
            where:{
                slug: slug
            }
        })
        if(existingRoom !== null){
            return res.status(400).json({
                message: "Provide a different room password"
            })
        }

        
        const newRoom = await prismaClient.room.create({
            data:{
                slug: slug,
                adminId: req.user.id
            }
        })

        return res.status(200).json({
            message: "Room created successfully!",
            room: newRoom
        })
    }else{
        return res.status(400).json({
            message: "Invalid room password sent"
        })
    }
})

app.listen(3001, () => {
    console.log('HTTP Backend server running on port 3001');
    console.log('CORS enabled for frontend on http://localhost:3000');
});