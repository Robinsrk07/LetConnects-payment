const express = require("express");
const ConnectDb = require("./config/database");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const paymentRouter =require("./routes/payment")

const app = express();
const port = 7000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json())


ConnectDb().then(()=>{
    console.log("payment connected");
    app.listen(port,()=>{
        console.log('server connected');
    })
    
})




app.use("/",paymentRouter)

app.use((err, req, res, next) => {
    
    if(err instanceof  NotFoundError){
        return res.status(err.statusCode ||404 ).json({message:err.message})
    }

    if (err instanceof ValidationError) {
        return res.status(err.statusCode || 400).json({ message: err.message });
      }

    if (err instanceof AuthenticationError) {
        return res.status(err.statusCode || 401).json({ message: err.message });
      }

      res.status(500).json({ message: 'Internal Server Error' });

    
});