const { connection } = require("../connections");
const { hash, transporter } = require("../helpers");
const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const { createVerificationToken, createAccessToken } = require("../helpers/token_create");

module.exports = {
    signUp: async (req, res) => {
        const { username, email, password } = req.body
        const msc = await connection.promise().getConnection()
        try {
            // Cek apakah akun telah terdaftar atau belum
            let sql = `select * from user where username = ? or email = ?`
            let [cekAkun] = await msc.query(sql, [username, email])
            if (cekAkun.length) {
                return res.status(400).send({ message: "username atau email telah terdaftar" })
            }
            // Jika tidak ada akun dengan username atau email yang diinput
            // Daftarkan akun
            sql = `insert into user set ?`
            const dataSignUp = {
                username,
                email,
                password: hash(password)
            }
            let [userBaru] = await msc.query(sql, dataSignUp)
            sql = `select * from user where id = ?`
            let [result] = await msc.query(sql, userBaru.insertId)
            let verificationTokenData = {
                id: result[0].id,
                username: result[0].username,
                user_role: result[0].user_role
            }
            // Buat email verifikasi
            const verificationToken = createVerificationToken(verificationTokenData)
            let filepath = path.resolve(
                __dirname,
                "../templates/verification_email.html"
            )
            let htmlString = fs.readFileSync(filepath, "utf-8")
            const template = handlebars.compile(htmlString)
            const htmlToEmail = template({
                username: username,
                token: verificationToken
            })
            await transporter.sendMail({
                from: "To Do <hilmawanzaky57@gmail.com>",
                to: "hilmawanzaky57@gmail.com",
                subject: "email verifikasiiii",
                html: htmlToEmail
            })
            msc.release()
            return res.status(200).send(result)
        } catch (error) {
            msc.release()
            return res.status(500).send({ message: error.message })
        }
    },
    verifyAccount: async (req, res) => {
        const { id } = req.user
        const msc = await connection.promise().getConnection()
        try {
            let sql = `update user set ? where id = ?`
            let verified = {
                is_verified: 1
            }
            await msc.query(sql, [verified, id])
            sql = `select * from user where id = ?`
            let [result] = await msc.query(sql, id)
            msc.release()
            return res.status(200).send(result)
        } catch (error) {
            msc.release
            return res.status(500).send({ message: error.message })
        }
    },
    logIn: async (req, res) => {
        const { username, email, password } = req.body
        const msc = await connection.promise().getConnection()
        try {
            let sql = `select * from user where (username = ? or email = ?) and password = ?`
            let [result] = await msc.query(sql, [username, email, hash(password)])
            if (!result.length) {
                return res.status(400).send({ message: "akun tidak ditemukan" })
            }
            let accessTokenData = {
                id: result[0].id,
                username: result[0].username,
                user_role: result[0].user_role
            }
            const accessToken = createAccessToken(accessTokenData)
            res.set("access-token", accessToken)
            msc.release()
            return res.status(200).send(result)
        } catch (error) {
            msc.release()
            return res.status(500).send({ message: error.message })
        }
    },
    rememberMe: async (req, res) => {
        const { id } = req.user
        const msc = await connection.promise().getConnection()
        let sql = `select * from user where id = ?`
        try {
            let [result] = await msc.query(sql, id)
            if (!result.length) {
                return res.status(400).send({ message: "akun tidak ditemukan" })
            }
            msc.release()
            return res.status(200).send(result)
        } catch (error) {
            msc.release()
            return res.status(500).send({ message: error.message })
        }
    }
};
