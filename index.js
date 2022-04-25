const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Ema-John-Server is running');
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rjako.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        await client.connect();
        const productCollection = client.db("emaJohn").collection("Products");

        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = productCollection.find(query);

            let products;
            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send(products);

            // const products = await cursor.limit(10).toArray(); to show only 10 product on ui.
        });

        //to know the number of data in database
        app.get('/productCount', async (req, res) => {
            /* const query = {};
            const cursor = productCollection.find(query); (obsolated). */

            // const count = await productCollection.countDocuments(); can be used definately and working well.
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        });

        //use post to get products by ids
        app.post('/products-by-keys', async (req, res) => {
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id));
            const query = { _id: { $in: ids } };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
    }
    finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log('John is listening on port: ', port)
});