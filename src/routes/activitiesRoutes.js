const express = require('express');
const router = express.Router();
const uploader = require('../helpers/uploader');
const {
  addActivity,
  getActivity,
} = require('./../controllers/activitiesControllers');

const uploadFileActivities = uploader('/activities', 'ACT').fields([
  { name: 'image', maxCount: 3 },
]);

// * after verifyJWT
router.use((req, res, next) => {
  req.user = {
    id: 1,
    username: 'admin',
    user_role: 1,
  };
  next();
});

router.get('/:activityName', getActivity);
router.post('/', uploadFileActivities, addActivity);

module.exports = router;
