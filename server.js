const express = require('express');
// const cors = require('cors');
const dotenv = require('dotenv');
const { Connect_DB } = require('./DB_Connections');
 const routes = require('./routes/index');
dotenv.config();
const app = express();
app.use(express.json());
Connect_DB();
const cors = require('cors');



// Enable CORS for all routes and all methods
app.use(cors()); 

app.use(express.json())



// app.use(cors())
const PORT = process.env.PORT || 8000
app.use('/uploads', express.static('uploads'));
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`Server is Running on Port ${PORT}`)
})
