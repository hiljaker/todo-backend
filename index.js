const express = require('express');
const app = express()
const cors = require('cors');
const port = 1234
const bearer = require('express-bearer-token');

app.use(express.json())
app.use(cors({
    exposedHeaders: ["verification-token"]
}))
app.use(bearer())

const { auth_routes, adminRoutes } = require('./src/routes');
app.use("/auth", auth_routes)
app.use("/admin", adminRoutes)

app.listen(port, () => {
    console.log(`server berjalan di port ${port}`);
})