const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",             
    host: "localhost",
    database: "collegeDATA", 
    password: "Ajay23",     
    port: 5432,
});

// Testing Connection with databse 
pool.connect((err, client, release) => {
    if (err) {
        console.error("Database Connection Failed!");
        console.error(err.message);
        return;
    }

    console.log(" PostgreSQL Connected Successfully");
    release();
});

module.exports = pool;