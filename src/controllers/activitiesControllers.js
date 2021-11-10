const fs = require('fs');
const { connection } = require('./../connections');

exports.getActivity = async (req, res) => {
  const { activityName } = req.params;
  const { id } = req.user;
  console.log(activityName);

  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query('select * from activity where id = ?;', [
      id,
    ]);
    const user = results;

    res.status(200).json({ results });
    conn.release();
  } catch (error) {
    conn.release();
    console.log(error);
    res.status(500).json({ message: error.message || 'server error' });
  }
};

exports.addActivity = async (req, res) => {
  req.body.data = {
    activity_name: 'nyapu2',
    description: 'nyapu beling',
    act_start: '2021-11-10 16:00:00',
    act_finish: '2021-11-10 16:30:00',
  };
  const { activity_name, description, act_start, act_finish } = req.body.data;

  // const { activity_name, description, act_start, act_finish } = JSON.parse(
  //   req.body.data
  // );
  const { image } = req.files;
  const { id } = req.user;

  let path = '/activities';
  let imagePath = image ? `${path}/${image[0].filename}` : null;
  const conn = await connection.promise().getConnection();
  try {
    // let sql1 = `
    // select activity_name, act_start, act_finish
    // from user
    // inner join activity on user.id = user_id
    // where (act_start < '2021-11-10 15:30:00' and '2021-11-10 15:30:00' < act_finish)
    // or (act_start < '2021-11-10 16:40:00' and '2021-11-10 16:40:00' < act_finish)
    // or ('2021-11-10 15:30:00' < act_start and act_finish < '2021-11-10 16:40:00')
    // limit 1;`;
    // const [overlaps]
    // ! check if start-finish overlaps with any other
    // ! parse string into datetime in sql to compare

    let sql = `insert into activity set ?`;
    if (!activity_name || !description || !act_start || !act_finish) {
      if (imagePath) {
        fs.unlinkSync('./public' + imagePath);
      }
      return res.status(400).json({ message: 'kurang input data' });
    }

    let dataInsert = {
      activity_name,
      image: imagePath,
      description,
      act_start,
      act_finish,
      user_id: id,
    };
    const [results] = await conn.query(sql, dataInsert);
    // console.log(results);

    return res.status(200).json({ message: 'berhasil add activity' });
  } catch (err) {
    if (imagePath) {
      fs.unlinkSync('./public' + imagePath);
    }
    // console.log('error :', err);
    return res.status(500).json({ message: err.message });
  }
};
