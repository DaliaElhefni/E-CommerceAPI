var cors = require('cors')
const express = require('express');
const mongoose = require('mongoose');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const productsRoutes = require('./routes/products');

const app = express();

const mongoURL = process.env.MONGO_URL || 'mongodb+srv://angularProject:angularProject@angularproject-p4l3j.mongodb.net/SouqDB?retryWrites=true&w=majority';
const port = process.env.PORT || 3000;

 mongoose.connect(mongoURL,
{
    useNewUrlParser: true,
    useUnifiedTopology: true
    }
    ).then(() => console.log('connected to MongoDb..'))
    .catch(err => console.log('failed to connect to Mongodb ', err.message));
    
    
    // to Handel Cors Error and allow any client to access api url 
    app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin , X-Requested-with , Content-Type , Accept , Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT , POST , GET , DELETE , PATCH')
        return res.status(200).json({});
    }
    next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/ProfileImages', express.static('ProfileImages'));


app.use('/users', usersRoutes);
app.use('/orders', ordersRoutes);

app.use('/products', productsRoutes)


app.listen(port, () => console.log("Server started..."));
