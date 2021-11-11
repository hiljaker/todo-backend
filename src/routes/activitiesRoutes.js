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
const testBodyData = (req, res, next) => {
  req.body.data = {
    activity_name: 'ngoding',
    description: 'blabla',
    act_start: '2021-11-10 17:00:00',
    act_finish: '2021-11-10 17:10:00',
  };
  req.body.data = JSON.stringify(req.body.data);
  next();
};

router.post('/', uploadFileActivities, testBodyData, addActivity); // * uses 'req.body.data' and 'req.files'
router.get('/:id?', getActivity); // * optional params
router.patch('/', uploadFileActivities, testBodyData, editActivity); // * uses 'req.body.data' and 'req.files'
router.delete('/:id', deleteActivity);

module.exports = router;
