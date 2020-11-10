const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
  });

// Redis Client Setup
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
// redis documentation states to create duplicate connection because 
// when an active connection is trying to connect, publish information or subscribe it cannot be used for other purposes
const redisPublisher = redisClient.duplicate(); 

// Express route handlers
app.get('/', (req, res) =>{
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    // using callback function instead of async await because redis library does not have out of the box promise support
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) =>{
    const index = req.body.index;

    // cap index values to values <= 40 from user because process time can be exponentially large
    if (parseInt(index) > 40){
        return res.status(422).send('Index is too large.');
    }

    // write index to redis DB w/ default message for calculated answer
    redisClient.hset('values', index, 'Nothing yet!'); 
    // notifies worker that new index has been provided to redis to allow processing of fib function to start
    redisPublisher.publish('insert', index); 
    // store submitted index into postgres DB
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true});
});

app.listen(5000, err => {
    console.log('Listening');
});