const fs = require('fs');
const { connection: pool } = require('./../connections');

// ? CREATE
exports.addActivity = async (req, res) => {
  req.body.data = {
    activity_name: 'mandi',
    description: 'blabla',
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
  const conn = await pool.promise().getConnection();
  // const { escape } = conn; // ! this doesn't work
  const esc = conn.escape.bind(conn); // ! bind to context of conn
  try {
    // * check if there exists any datetime overlaps
    let sql = `
    SELECT activity_name, act_start, act_finish FROM activity
    WHERE user_id = ${esc(id)}
    AND((act_start <= ${esc(act_start)} AND ${esc(act_start)} < act_finish)
    OR (act_start < ${esc(act_finish)} AND ${esc(act_finish)} <= act_finish)
    OR (${esc(act_start)} < act_start AND act_finish < ${esc(act_finish)}));`;
    // LIMIT 1;`;
    const [overlaps] = await conn.query(sql);
    // * if exist an overlap
    if (overlaps.length) {
      conn.release();
      return res.status(200).json({ overlaps });
    }

    sql = `insert into activity set ?`;
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
    // // console.log(results);

    conn.release();
    return res.status(200).json({ message: 'berhasil add activity' });
  } catch (err) {
    conn.release();
    if (imagePath) {
      fs.unlinkSync('./public' + imagePath);
    }
    console.log('error :', err);
    return res.status(500).json({ message: err.message });
  }
};

// ? READ
exports.getActivity = async (req, res) => {
  const { activity_name } = req.params;
  const { id } = req.user;

  const conn = await pool.promise().getConnection();
  try {
    let sql = 'SELECT * FROM activity WHERE user_id = ?';

    // * get all activities if no params
    if (activity_name === undefined) sql += ';';
    else sql += ' AND activity_name = ?;';

    const [results] = await conn.query(sql, [id, activity_name]);

    conn.release();
    return res.status(200).json({ results });
  } catch (error) {
    conn.release();
    console.log(error);
    return res.status(500).json({ message: error.message || 'server error' });
  }
};

// ? UPDATE
exports.editActivity = async (req, res) => {
  const { id } = req.user;
  const conn = await pool.promise().getConnection();
  try {
    conn.release();
    return res.status(200).json({ results });
  } catch (error) {
    conn.release();
    console.log(error);
    return res.status(500).json({ message: error.message || 'server error' });
  }
};

// ? DELETE
exports.deleteActivity = async (req, res) => {
  // * activity_name assumed to be unique in the database
  const { activity_name } = req.params;
  const { id } = req.user;

  const conn = await pool.promise().getConnection();
  try {
    let sql = 'DELETE FROM activity WHERE user_id = ? AND activity_name = ?;';
    const [results] = await conn.query(sql, [id, activity_name]);

    conn.release();
    if (results?.affectedRows) {
      return res
        .status(200)
        .json({ results: { deleted: results.affectedRows } });
    } else {
      return res
        .status(400)
        .json({ message: `no activity named '${activity_name}'` });
    }
  } catch (error) {
    conn.release();
    console.log(error);
    return res.status(500).json({ message: error.message || 'server error' });
  }
};
