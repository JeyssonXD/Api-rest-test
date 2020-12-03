import express from 'express';
import path from 'path';
import bodyparser from 'body-parser';

import account from './routes/account';
import books from './routes/books';

const app = express();

app.use(bodyparser.json());
app.use("/api/account",account);
app.use("/api/books",books);

app.get('/*',(req,res)=>{
  res.sendFile(path.join(__dirname,'public/index.html'));
});

app.listen(8080, ()=> console.log("Running on localhost:8080"));