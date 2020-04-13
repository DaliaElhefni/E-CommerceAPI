const express = require('express');
const mongoose = require('mongoose');
const usersRoutes = require('./routes/users');


const app = express();
app.use(express.json());

 mongoose.connect('mongodb+srv://angularProject:angularProject@angularproject-p4l3j.mongodb.net/SouqDB?retryWrites=true&w=majority',
// mongoose.connect('mongodb://localhost:27017/souqappdb',
{
useNewUrlParser:true,
useUnifiedTopology:true
}
).then(()=>console.log('connected to MongoDb..'))
.catch(err => console.log('failed to connect to Mongodb ',err.message));


app.use('/user',usersRoutes)

app.listen(3000, () =>console.log("Server started at port 3000.."));
