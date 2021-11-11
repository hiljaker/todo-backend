const {connection} = require("../connections")
// pushulang

module.exports = {
    activateAcc: async(req,res) => {
        console.log(req.body)
        const { userId, username } = req.params
        const conn = await connection.promise().getConnection()
        if (!username || !userId){
            return res.status(400).send({message : "user belum login"})
        }
        try {
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
        console.log(req.body)
        const { userId, username } = req.params
        const conn = await connection.promise().getConnection()
        if (!username || !userId){
            return res.status(400).send({message : "user belum login"})
        }
        try {
            let userUpdate = {
                is_deleted: 1
            }
            let sql =  `update user set ? where id = ?`
            await conn.query(sql, [userUpdate, userId])
            conn.release()
            return res.status(200).send({message: "deactivated account success"})
        } catch (error) {
            conn.release()
            console.log(error)
            res.status(500).send({message:error.message || "server error"})
        }
    }
}