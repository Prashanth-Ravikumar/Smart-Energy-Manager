const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./src/routes/userRoutes');
const deviceRoute = require('./src/routes/deviceRoutes');

const app = express();

app.use(express.json());

app.use('/api/',userRoute);
app.use('/api/',deviceRoute);

mongoose.connect('mongodb://localhost:27017/energy-management')
.then(()=>{
    console.log("Connected to db");
    
    app.listen(3000, ()=>{
        console.log("Server is running at port 3000");
    })
    
})
.catch((err)=>{
    console.log(err);
});