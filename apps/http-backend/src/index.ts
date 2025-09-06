import express from "express"
import {signUpSchema, signInSchema} from "@repo/validations"

const app = express();

app.post("signin", (req,res)=>{
    if(signInSchema.safeParse(req.body).success){
        const {username, password} = req.body;
        if(0){ //username doesn't exist in the db
            res.status(400).json({
                message : `${username} doesn't exist`
            })
        }
        if(0){//username and password doesn't match
            res.status(400).json({
                message : "username and password doesn't match"
            })
        }
        if(1){ //username and password matches
            res.status(200).json({
                message: "Login successful!"
            })
        }
    }else{
        res.status(400).json({
            message: "Invalid Credentials"
        })
    }
})

app.post("signup", (req,res)=>{

    if(signUpSchema.safeParse(req.body).success){
        const {username, password} = req.body;
        if(0){//username already exists
            res.status(400).json({
                message : "username already exists!!"
            })
        }
        if(1){
            res.status(400).json({
                message : "Signup successful!"
            })
        }
    }else{
        return res.status(400).json({
            message : "Invalid credentials!"
        })
    }
})

app.post("create-room", (req,res)=>{
    
})

app.listen(3000)