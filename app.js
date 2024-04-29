const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());

// sql connection string
const connectionString = 'postgresql://navraj:TPYmW8Nfs0o5NZ2jjpw3xA@windy-cuscus-14312.7tt.aws-us-east-1.cockroachlabs.cloud:26257/flappy-bird?sslmode=verify-full&sslrootcert=root.crt';

const pool = new Pool({
  connectionString: connectionString,
});

app.use(express.static('public'));

//GETTING SCORES BACKEND
async function getScoresServer() {
    const res = await pool.query('SELECT * FROM flappy_scores;');
    return res.rows;
 }
app.get('/getScores', async (req, res) => {
    const scores = await getScoresServer();
    res.json(scores);
});

//Getting scores and sending to frontend
async function getHighestScoresServer() {
  const res = await pool.query('SELECT *  FROM flappy_scores ORDER BY SCORE DESC LIMIT 5;');
  return res.rows;
}
app.get('/getHighestScores', async (req, res) => {
    const leaderboard = await getHighestScoresServer();
    res.json(leaderboard);
});

//SENDING SCORES BACKEND
async function sendScoresServer(name, score) {
  const res = await pool.query('INSERT INTO flappy_scores (name, score) VALUES (\'' + name + '\', ' + score + ');');
  return res.rowCount;
}
app.post('/sendScore', async (req, res) => {
  const { name, score } = req.body;
  const rowCount = await sendScoresServer(name, score);
  if (rowCount > 0) {
    res.json({ message: 'Score sent successfully' });
  } else {
    res.status(500).json({ message: 'Failed to send score' });
  }
});

//DELETING SCORES BACKEND
async function deleteScoresServer(score) {
  await pool.query('DELETE FROM flappy_scores where score<' + score + ';');
  console.log(score);
}
app.post('/deleteScores', async (req, res) => {
  const { score } = req.body;
  await deleteScoresServer(score);
});

//default route
app.get('/', (req, res) => {
    res.send('Hello, world!');
  });

//listen on port 3000
app.listen(3000, () => console.log('Server listening on port 3000'));