const express=require("express")
const app=express()
const cors=require("cors")

const jwt = require('jsonwebtoken');
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express')

const port = process.env.PORT || 5000;
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})
function verifyJWT (req,res,next){
    const authHeader=req.headers.authorization
    if(!authHeader){
        return res.status(401).send({message:"Unauthorized access"})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        
        req.decoded = decoded;
        next();
    })
    
}

app.get('/',(req,res)=>{
    res.send("Hello Bicyle-parts-manufacture backend sever")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7auxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const collection=client.db("bicyle-parts").collection("parts")
        const userInfo=client.db("bicyle-parts").collection("userInfo")
        const userCollection=client.db("bicyle-parts").collection("user")
        const reviewCollection=client.db("bicyle-parts").collection("review")
        const orderCollection=client.db("bicyle-parts").collection("order")
        const paymentCollection=client.db("bicyle-parts").collection("payment")

        //verifyAdmin
const verifyAdmin=async(req,res,next)=>{
    const requester=req.decoded.email
const requesterAccount=await userCollection.findOne({email:requester})
if(requesterAccount.role=="admin"){
next()

}
}
const stripe = require('stripe')(process.env.STRIPE_KEY);

//payment api create
app.post('/create-payment-intent', verifyJWT, async (req, res) => {
    const product = req.body;
    const price = product.price;
    const amount = price * 100;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
    })
    res.send({ clientSecret: paymentIntent.client_secret })
})
   app.get('/serial',async(req,res)=>{
    const query={}
    const result=DportalSer.find(query).project({name:1})
    const problem=await result.toArray()
    res.send(problem)
   })
   app.patch('/order/:id', verifyJWT, async (req, res) => {
    const id = req.params.id;
    const payment = req.body;
    const filter = { _id: ObjectId(id) };
    const updatedDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }

    const result = await paymentCollection.insertOne(payment);
    const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
    res.send(updatedOrder);
})

        //get api for parts
       app.get('/parts',async(req,res)=>{
        const query={}
        const result=collection.find(query)
        const parts=await result.toArray()
        res.send(parts)
       })
       app.get('/parts/:id',async(req,res)=>{
        const id=(req.params.id);
        const query={_id:ObjectId(id)}
        const result=await collection.findOne(query)
        res.send(result)
    })
    //update specific item
    app.put('/parts/:id', async (req, res) => {
        const id = req.params.id;
        const updatedQuantity = req.body.updatedQuantity;
        console.log(updatedQuantity);
        const filter = { _id: ObjectId(id) };
        console.log(filter);
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                quantity: updatedQuantity
            }
        };
        const result = await collection.updateOne(filter, updatedDoc, options);
            
            res.send(result);

        })
    //delete specific order
    app.delete('/puts/:id',verifyJWT,async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)}
        const result = await collection.deleteOne(query);
        res.send(result)

    })
       //user info api create
      //put method for add info user
 app.put('/info/:email',async(req,res)=>{
    const email=req.params.email
    const user=req.body
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
        $set: user
      };
      const result = await userInfo.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
      res.send({ result, token });
   })
       //user info api get
       app.get("/userinfo",async(req,res)=>{
        const email=req.query.email

   
        const query={email:email}
        const info=await userInfo.findOne(query)
        res.send(info)
       })
 //put method for add user
 app.put('/user/:email',async(req,res)=>{
    const email=req.params.email
    const user=req.body
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
        $set: user
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1y' })
      res.send({ result, token });
   })
//    //admin api
   app.get('/admin/:email',async(req,res)=>{
    const email=req.params.email 
    const user=await userCollection.findOne({email:email})
    const isAdmin=user.role==="admin"
    res.send({admin:isAdmin})
   })
   //put method for add admin
   app.put('/user/admin/:email',verifyJWT,verifyAdmin,async(req,res)=>{
    const email=req.params.email

    const filter = { email: email };
    
    const updateDoc = {
        $set: {role:"admin"}
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      
      res.send({ result });

   })
   //get
app.get('/user',verifyJWT,async(req,res)=>{
    const query=req.params.email
        const result=userCollection.find(query)
        const user=await result.toArray()
        res.send(user)
})
//review add
app.post('/review',async(req,res)=>{
    const doc =req.body;
    const result=await reviewCollection.insertOne(doc)
    res.send(result)
    
})
app.get('/review',async(req,res)=>{
    const query={}
        const result=reviewCollection.find(query)
        const user=await result.toArray()
        res.send(user)
})
//add Product
app.post('/parts',verifyJWT,verifyAdmin,async(req,res)=>{
    const doctor =req.body;
    const result=await collection.insertOne(doctor)
    res.send(result)
    
})
// post order

        app.post('/order',async(req,res)=>{
            const order=req.body;
            const result=await orderCollection.insertOne(order);
            res.send(result);
        })
        app.get('/order/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=orderCollection.find(query)
            const item=await result.toArray()
            res.send(item)
           })
        //get orders from a user ...
        app.get('/order',verifyJWT,async(req,res)=>{
            const customer=req.query.customer;
           const decodedEmail=req.decoded.email;
           if(customer===decodedEmail){
            
            const query={customer:customer};
            const orders=await orderCollection.find(query).toArray();
                return res.send(orders);
           }
           else{
               return res.status(403).send({message:'forbidden access'})
           }
            
        })
        app.get('/manageOrder',verifyJWT, async(req,res)=>{
            const query=req.body
            const result=orderCollection.find(query)
            const orders=await result.toArray()
            res.send(orders)
           })
        
         //delete specific order
     app.delete('/order/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)}
        const result = await orderCollection.deleteOne(query);
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
