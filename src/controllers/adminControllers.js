const {connection} = require("../connections")
// pushulang

module.exports = {
    activateAcc: async(req,res) => {
        console.log(req.params)
        const { userId, username } = req.params
        const conn = await connection.promise().getConnection()
        try {
            if (!username || !userId){
                throw res.status(400).send({message : "user belum login"})
            }
            let userUpdate = {
                is_deleted: 0
            }
            let sql =  `update user set ? where id = ?`
            await conn.query(sql, [userUpdate, userId])
            conn.release()
            return res.status(200).send({message: "re-activated account success"})
        } catch (error) {
            conn.release()
            console.log(error)
            res.status(500).send({message:error.message || "server error"})
        }

    },
    deactivateAcc : async(req,res) => {
        console.log(req.params)
        const { userId , username } = req.params
        const conn = await connection.promise().getConnection()
        try {
            if (!username || !userId){
                throw res.status(400).send({message : "user belum login"})
            }
            let userUpdate = {
                is_deleted: 1
            }
            sql =  `update user set ? where id = ?`
            await conn.query(sql, [userUpdate, userId])
            conn.release()
            return res.status(200).send({message: "deactivated account success"})
        } catch (error) {
            conn.release()
            console.log(error)
            res.status(500).send({message:error.message || "server error"})
        }
    },
    getuserAcc : async (req,res) => {
        let { pages,limit, active,deactive } = req.query
        const conn = await connection.promise().getConnection()
        //! limit cuman contoh nanti diganti dari query!
        // limit = 3
        if (!pages){
            pages = 0
        }
        let offset = pages * parseInt(limit)
        let querySql = ""
        if (active){
            querySql += ` and is_deleted = 0`
        }
        if(deactive){
            querySql += ` and is_deleted = 1`
        }
        try {
            let sql = `select * from user where true ${querySql} limit ?,? `
            console.log(sql)
            const [userData] = await conn.query(sql, [offset, parseInt(limit)])

            sql = `select count(*) as total_user from user where true ${querySql}`
            querySql = ""
            const [result] = await conn.query(sql,offset,limit)
            console.log(result[0].total_user)
            res.set("x-total-count", result[0].total_user)

            conn.release()
            return res.status(200).send(userData)
        } catch (error) {
            conn.release()
            console.log("error diadmin :", error)
            return res.status(500).send({message:error.message || "server error"})
        }
    },
}