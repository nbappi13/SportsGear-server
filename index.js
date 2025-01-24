const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware use
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('b10 server is runnnig!')
})


app.listen(port, () => {
    console.log(`b10 server is runnig on port: ${port}`);
})