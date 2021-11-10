const express = require('express');
const router = express.Router();
const uploader = require('../helpers/uploader');
const {
  addActivity,
  getActivity,
  editActivity,
  deleteActivity,
} = require('./../controllers/activitiesControllers');

const uploadFileActivities = uploader('/activities', 'ACT').fields([
  { name: 'image', maxCount: 3 },
]);

// * after verifyJWT get 'req.user'
router.post('/', uploadFileActivities, addActivity);
router.get('/:activity_name?', getActivity); // * optional params
router.patch('/', editActivity); // * pass edit details in 'req.body'
router.delete('/:activity_name', deleteActivity);

module.exports = router;
