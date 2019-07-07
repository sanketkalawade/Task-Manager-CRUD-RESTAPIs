const express = require('express');
const userRouter = require('./routers/user_router');
const taskRouter = require('./routers/tasks_router');
require('./db/mongoose') // we dont need anything from this but in this file our app connects to mongodb so we only require it for connection.

const app = express();
const PORT = process.env.PORT || 3000;

// app.use((req,res,next)=>{
//     res.status(503).send("This site is under construction!!")
// })

app.use(express.json()) //configuring the express to convert all incoming request json to js object. 
app.use(userRouter);
app.use(taskRouter);



app.listen(PORT,()=>{
    console.log("Server is up and running on port: "+ PORT);
    
})