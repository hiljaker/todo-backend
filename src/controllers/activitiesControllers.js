const fs = require('fs');
const { connection: pool } = require('./../connections');

// ? CREATE
exports.addActivity = async (req, res) => {
  const { activity_name, description, act_start, act_finish } = JSON.parse(
    req.body.data
  );
  const { image } = req.files;
  const { id } = req.user;

  let path = '/images/activities';
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
      if (imagePath) {
        fs.unlinkSync('./public' + imagePath);
      }
      return res.status(400).json({ overlaps });
    }

    sql = `insert into activity set ?`;
    if (!activity_name || !description || !act_start || !act_finish) {
      if (imagePath) {
        fs.unlinkSync('./public' + imagePath);
      }
      return res.status(400).json({ message: 'incomplete input data' });
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
    return res.status(200).json({ message: 'successfully added new activity' });
  } catch (error) {
    conn.release();
    if (imagePath) {
      fs.unlinkSync('./public' + imagePath);
    }
    // console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// ? READ
exports.getActivity = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const conn = await pool.promise().getConnection();
  try {
    let sql =
      'SELECT id, activity_name, image, description, act_start, act_finish FROM activity WHERE user_id = ?';

    // * get all activities if id param is not set
    if (id === undefined) sql += ';';
    else sql += ' AND id = ?;';

    const [results] = await conn.query(sql, [user_id, id]);

    conn.release();
    return res.status(200).json({ results });
  } catch (error) {
    conn.release();
    // console.log(error);
    return res.status(500).json({ message: error.message || 'server error' });
  }
};

// ? UPDATE
exports.editActivity = async (req, res) => {
  const newData = JSON.parse(req.body.data);
  const { image } = req.files;
  const { id, act_start, act_finish } = newData;
  const user_id = req.user.id;

  let path = '/images/activities';
  let imagePath = image ? `${path}/${image[0].filename}` : null;

  const conn = await pool.promise().getConnection();
  const esc = conn.escape.bind(conn);
  try {
    if (act_start || act_finish) {
      // * check if there exists any datetime overlaps with activities other than this one
      const sql = `
      SELECT id, activity_name, act_start, act_finish FROM activity
      WHERE user_id = ${esc(user_id)}
      AND (id <> ${esc(id)})
      AND((act_start <= ${esc(act_start)} AND ${esc(act_start)} < act_finish)
      OR (act_start < ${esc(act_finish)} AND ${esc(act_finish)} <= act_finish)
      OR (${esc(act_start)} < act_start AND act_finish < ${esc(act_finish)}));`;
      // LIMIT 1;`;
      const [overlaps] = await conn.query(sql);
      // * if exist an overlap
      if (overlaps.length) {
        conn.release();
        if (imagePath) {
          fs.unlinkSync('./public' + imagePath);
        }
        return res.status(400).json({ overlaps });
      }
    }

    let sql = `SELECT id, image FROM activity WHERE user_id = ? AND id = ?;`;
    let [oldData] = await conn.query(sql, [user_id, id]);
    if (!oldData.length) {
      conn.release();
      if (imagePath) {
        fs.unlinkSync('./public' + imagePath);
      }
      return res.status(400).json({ message: `no activity with id: ${id}` });
    }

    sql = `UPDATE activity SET ? WHERE id = ?`;
    let dataUpdate = {
      ...newData,
    };
    if (imagePath) {
      dataUpdate.image = imagePath;
    }
    const [results] = await conn.query(sql, [dataUpdate, id]);
    // * if update on database is successful
    if (results.affectedRows) {
      // * delete old image from public
      if (imagePath && oldData[0].image) {
        fs.unlinkSync('./public' + oldData[0].image);
      }
    }

    conn.release();
    return res.status(200).json({
      message: `successfully edited activity with id: ${id}`,
    });
  } catch (error) {
    conn.release();
    if (imagePath) {
      fs.unlinkSync('./public' + imagePath);
    }
    // console.log(error);
    return res.status(500).json({ message: error.message || 'server error' });
  }
};

// ? DELETE
exports.deleteActivity = async (req, res) => {
  // * activity_name assumed to be unique in the database
  const { id } = req.params;
  const user_id = req.user.id;

  const conn = await pool.promise().getConnection();
  try {
    let sql = 'SELECT id, image FROM activity WHERE user_id = ? AND id = ?';
    const [data] = await conn.query(sql, [user_id, id]);
    // * if data exists
    if (data.length) {
      // * delete from database
      sql = 'DELETE FROM activity WHERE id = ?;';
      const [results] = await conn.query(sql, [data[0].id]);
      // * if delete from database is successful
      if (results.affectedRows) {
        // * delete image from public
        if (data[0].image) {
          if (fs.existsSync('./public' + data[0].image)) {
            fs.unlinkSync('./public' + data[0].image);
          }
        }
      }

      conn.release();
      return res.status(200).json({
        message: `successfully deleted activity with id: ${id}`,
      });
    } else {
      conn.release();
      return res.status(400).json({ message: `no activity with id: ${id}` });
    }
  } catch (error) {
    conn.release();
    // console.log(error);
    return res.status(500).json({ message: error.message || 'server error' });
  }
};
