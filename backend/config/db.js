const {Pool} = require('pg');

const pool = new Pool({
    user: process.env.DB_HOST,
    host: "localhost",
    database: "mycinema",
    password: process.env.DB_PASSWORD,
    port: 5432
})

module.exports = pool