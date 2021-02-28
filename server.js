const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: true }));


// Configuring the database
const dbConfig = require('./app/config/database.config.js');
const mongoose = require('mongoose');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cors());



mongoose.Promise = global.Promise;
// Connecting to the database
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});


require('./app/routes/admin.route')(app)
require('./app/routes/participant.route')(app)
require('./app/routes/question.route')(app)
require('./app/routes/game.route')(app)
require('./app/routes/gift.route')(app)

const port = process.env.PORT || 8080;

module.exports =
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})