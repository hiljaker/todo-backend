require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 1234;
const bearer = require('express-bearer-token');
const { verifyAccessToken } = require('./src/helpers/token_verify');

app.use(express.json());
app.use(
  cors({
    exposedHeaders: ['access-token'],
  })
);
app.use(bearer());

const { auth_routes, adminRoutes, activitiesRoutes } = require('./src/routes');
app.use('/auth', auth_routes);
app.use('/admin', adminRoutes);
// app.use('/activities', verifyAccessToken, activitiesRoutes);
app.use(
  '/activities',
  (req, res, next) => {
    req.user = {
      id: 1,
      username: 'admin',
      user_role: 1,
    };
    next();
  },
  activitiesRoutes
);

app.listen(port, () => {
  console.log(`server berjalan di port ${port}`);
});
