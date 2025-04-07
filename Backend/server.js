const express = require('express');
const cors = require('cors');
const db = require('./db/dbconnect')
const Routes = require('./routes/Routes');

const app = express();
app.use(cors());
app.use(express.json()); 

app.use('/api', Routes);




app.listen(8081, () => {
  console.log("Server running on port 8081");
  console.log("ga gana paman ah");
});
