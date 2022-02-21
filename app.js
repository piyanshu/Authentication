//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'error in connecting to db'));
db.once('open', function(){
    console.log('successfully connected to db');
});
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
const secret = 'ThisisourLittleSecret';
userSchema.plugin(encrypt, {secret: secret}, {encryptedFields: ['password']});
const User = new mongoose.model('User', userSchema);


app.get('/', function(req, res){
    return res.render('home');
});
app.get('/login', function(req, res){
    return res.render('login');
});
app.get('/register', function(req, res){
    return res.render('register');
});
app.post('/register', function(req, res){
    const newuser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newuser.save(function(err){
        if(!err){
            return res.render('secrets');
        }
        else{
            console.log(err);
        }
    });

});
app.post('/login', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, function(err, foundUser){
        if(err){
            console.log('error');
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    return res.render('secrets');
                }
                else{
                    return res.send('error');
                }
            }
        }
    })
});
app.listen(8000, function(req, res){
    console.log('Server is running on port 8000');
});