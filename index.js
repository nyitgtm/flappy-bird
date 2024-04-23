const { Pool, Client } = require('pg')

const username = 'navraj' // database username
const password = 'rj-AG6_3McmOOGT0x84PPw' // database password
const certpath = 'root.crt' // path to root certificate

// Might need to be changed
const database = 'flappy-bird' // database
const host     = 'windy-cuscus-14312.7tt.aws-us-east-1.cockroachlabs.cloud' // cluster host

const connectionString = 'postgresql://' + // use the postgresql wire protocol
    username +                       // username
    ':' +                            // separator between username and password
    password +                       // password
    '@' +                            // separator between username/password and port
    host +                           // host
    ':' +                            // separator between host and port
    '26257' +                        // port, CockroachDB Serverless always uses 26257
    '/' +                            // separator between port and database
    database +                       // database
    '?' +                            // separator for url parameters
    'sslmode=verify-full' +          // always use verify-full for CockroachDB Serverless
    '&' +                            // url parameter separator
    'sslrootcert=' + certpath      // full path to ca certificate 

function executeQuery(query) {
    const pool = new Pool({
        connectionString,
    })

    pool.query(QUERY, (err, res) => {
        var results = res.rows;
        console.log(results);
        pool.end()
  })
}

function getHighestScoresServer() {
    const QUERY = 'SELECT *  FROM flappy_scores ORDER BY SCORE DESC LIMIT 5;'
    executeQuery(QUERY);    
}

function sendScoresServer(name, score) {
    const QUERY = 'INSERT INTO flappy_scores (name, score) VALUES (\'' + name + '\', ' + score + ');'
    executeQuery(QUERY);
}


module.exports = getHighestScoresServer;
module.exports = sendScoresServer;