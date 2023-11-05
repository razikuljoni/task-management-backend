const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')

const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })

        app.get('/', (req, res) => {
            res.send('Task Management Server is running successfully!')
        })

        const taskCollection = client.db('task_management').collection('users_data')

        app.get('/users_data', async (req, res) => {
            const cursor = taskCollection.find({})
            const userData = await cursor.toArray()
            res.send(userData)
        })

        app.post('/users_data', async (req, res) => {
            const data = req.body
            const exists = await taskCollection.findOne({ email: data?.email })
            if (exists) {
                // Existing user found, update the tasks array
                const result = await taskCollection.findOneAndUpdate(
                    { user_email: data?.user_email },
                    { $push: { tasks: { task_name: data.task_name, task_description: data.task_description } } },
                    { returnOriginal: false }
                );
                res.send(result);
                console.log("update", result);
            } else {
                // User not found, insert new data
                const result = await taskCollection.insertOne({
                    user_email: data?.email,
                    user_name: data.user_name,
                    tasks: [
                        { task_name: data.task_name, task_description: data.task_description }
                    ]
                });
                res.send(result);
                console.log("insert", result);
            }

        })
    } catch (err) {
        console.log(err.message);
    }
}
run().catch(console.dir);


