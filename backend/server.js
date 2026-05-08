require('dotenv').config()
const express = require('express');
const cors = require('cors')
const app = express();
const authRoutes = require('./routes/authRoutes')

const pool = require('./config/db')

app.use(cors());
app.use(express.json());

app.use("/api/auth/",authRoutes)


app.get('/test-db',async (req,res)=>{
    try{
        const result = await pool.query("SELECT NOW()");
        res.json(result.rows)
    } catch (err){
        console.error(err);
        res.status(500).json({error: "DB connection failed"})
    }
})

app.listen(3000,()=>{
    console.log("Server started at localhost:3000")
})