const express = require('express');
const app = express()
const cors = require('cors');
const port = 1234
const bearer = require('express-bearer-token');
const { auth_routes } = require('./src/routes');

app.use(express.json())
app.use(cors({
    exposedHeaders: ["verification-token"]
}))
app.use(bearer())

app.use("/auth", auth_routes)

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`);
})