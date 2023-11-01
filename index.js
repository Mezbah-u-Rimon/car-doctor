const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const cookieParser = require('cookie-parser')
// const jwt = require('jsonwebtoken')
const jwt = require('jsonwebtoken') //1st
const cookieParser = require('cookie-parser') // 6th
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
//3th
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://localhost:5174',

        "https://auth-moha-milon-286da.web.app/",
        "https://auth-moha-milon-286da.firebaseapp.com/?_gl=1*1mk3nwb*_ga*MTYyNzEwMjY1Ny4xNjk1ODc4NjU1*_ga_CW55HF8NVT*MTY5ODc2NTUwMS43My4xLjE2OTg3NjU2MDkuNTEuMC4w"
    ],
    credentials: true,
}));
app.use(express.json());
// 7 th
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgd8wc9.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

//create middleware
// number 1
const logger = (req, res, next) => {
    console.log('log : info', req.method, req.url);
    next();
}

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    // console.log('token in the cookie', token);
    // no token available
    if (!token) {
        return res.status(401).send({ message: 'unauthorize access' });
    }
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorize access' });
        }
        req.user = decoded;
        next()
    })
}



async function run() {
    try {

        const serviceCollection = client.db("carDoctor").collection("services");
        const bookingCollection = client.db("carDoctor").collection("bookings");


        //secret key command
        // require('crypto').randomBytes(64).toString('hex')


        // Auth related APIs //2nd
        app.post("/jwt", logger, async (req, res) => {
            const user = req.body;
            console.log("user loggedIn Successfully", user);
            const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '100000h' });
            //4th
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true })
        })

        // 5th clear cookies
        app.post("/logout", async (req, res) => {
            const user = req.body;
            console.log("logging out user", user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })



        //services related api
        app.get("/services", logger, async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await serviceCollection.findOne(query, options);
            res.send(result);
        })


        // Bookings
        //some data find concept
        app.get("/bookings", logger, verifyToken, async (req, res) => {
            // console.log('tok tok token', req.cookies);
            console.log('user in the valid token', req.user);
            if (req?.query?.email !== req?.user?.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            let query = {}
            if (req.query?.email) {
                query = { email: req.query?.email }
            }

            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })


        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result)
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            const updateDoc = {
                $set: {
                    status: updatedBooking.status,
                }
            }
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        await client.connect();

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", async (req, res) => {
    res.send("car doctor is running on port")
})

app.listen(port, () => {
    console.log(`car doctor server is running on port ${port}`)
})
