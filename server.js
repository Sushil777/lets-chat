const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

const keys = require('./config/keys');
const Message = require('./models/Message');

const UserRoutes = require('./routes/users');

mongoose.connect(keys.mongoUri, { useNewUrlParser: true })
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


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

app.use('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
})

app.use('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
})

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
})

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});