# Objective
use this to make main elements that everyone will share. 

# Delete this later

navraj
cggCRlHr5BkoGRvNco8AEA

export DATABASE_URL="postgresql://navraj:cggCRlHr5BkoGRvNco8AEA@windy-cuscus-14312.7tt.aws-us-east-1.cockroachlabs.cloud:26257/flappy-bird?sslmode=verify-full"


const { Client } = require("pg");

const client = new Client(process.env.DATABASE_URL);

(async () => {
  await client.connect();
  try {
    const results = await client.query("SELECT NOW()");
    console.log(results);
  } catch (err) {
    console.error("error executing query:", err);
  } finally {
    client.end();
  }
})();