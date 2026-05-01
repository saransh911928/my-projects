//Importing express package
const express = require('express')
const dotenv =  require('dotenv');
const mongoose = require('mongoose');

//Routes import
const workoutRoutes = require('./routes/workout');
const userRoutes = require('./routes/user');

dotenv.config();

// Express APP
const app = express()

//middleware to parse JSON bodies
app.use(express.json());

app.use((req,res,next)=>{
    console.log(req.path, req.method)
    next()
});

//Routes (http://localhost:4000/)
app.get('/', (req, res) => {
  res.json({msg:'Welcome to our application'})
});

app.use('/api/workouts',workoutRoutes);
app.use('/api/user', userRoutes);

//PORT num
const PORT = process.env.PORT || 4000;

//Connect to db
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  //listen for requests
app.listen(PORT,()=>{
    console.log(`Server is up and listening at: http://localhost:${PORT} & connected to our db- Saransh Beohar 91128`);
});
})
.catch((error)=>{console.log(error)});

// //From chatGPT to check backend is running
// app.get("/health", (req, res) => {
//   res.send("Backend is running 🚀");
// });
