const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const keys = require('./config/keys');
const Message = require('./models/Message');

const UserRoutes = require('./routes/users');

// var session = require('express-session');
// app.use(session({secret: 'mySecret', resave: false, saveUninitialized: false}));

mongoose.connect(keys.mongoUri, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})

app.get('/messages/:user', (req, res) => {
  var user = req.params.user
  Message.find({name: user},(err, messages)=> {
    res.send(messages);
  })
})

app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})


io.on('connection', () =>{
  console.log('a user is connected')
})

app.use('/user', UserRoutes);

app.use((req, res) =>{
  res.render('page-not-found');
})

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});