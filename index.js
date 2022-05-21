const express=require("express")
const app=express()

require('dotenv').config()
const cors=require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express')
app.use(cors())
const port = process.env.PORT || 5000;
app.use(express.json());
app.get('/',(req,res)=>{
    res.send("Hello Bicyle-parts-manufacture backend sever")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7auxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const collection=client.db("bicyle-parts").collection("parts")
        //get api for parts
       app.get('/parts',async(req,res)=>{
        const query={}
        const result=collection.find(query)
        const parts=await result.toArray()
        res.send(parts)
       })
       app.get('/parts/:id',async(req,res)=>{
        const query={}
        const result=collection.findOne(query)
        
        res.send(result)
       })

    }
    finally{

    }

}
run().catch(console.dir)
app.listen(port,()=>{
    console.log(`Running server ${port}`);
})
