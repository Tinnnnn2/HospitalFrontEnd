const express = require('express');
const axios = require('axios');
const path = require("path");
const app = express();
var bodyParser = require('body-parser');
const multer  = require('multer');
const { render } = require('ejs');
const session = require('express-session')

const base_url = "https://hospitalbackend-j8ny.onrender.com"; //ตำแหน่งBack End

app.set("views",path.join(__dirname,"/public/views"));
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(__dirname + '/public'));
    
app.use(
    session({
      secret: "I don't know either",
      resave: false,
      saveUninitialized: false,
    })
  );

const putimg = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, './public/img/products'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const img = multer({ storage: putimg });

const onlyAdmin = (req,res,next) => {
    if(req.session.logindata.level == "admin"){
        next();
    } else {
        res.redirect("/shop");
    }
}

const onlyUser = (req,res,next) => {
    if(req.session.logindata.level == "user"){
        next();
    } else {
        res.redirect("/shop");
    }
}
app.get("/",(req, res) => {
    
    res.redirect("/login");
});

//--------------------------------------------------------------

app.get("/shop",async(req, res) => {
    const response = await axios.get(base_url + "/Products");
    const response2 = await axios.get(base_url + "/Types");
    
    console.log(req.session.logindata)
    if(!req.session.logindata){
        req.session.logindata = {
        username: ""
        }
    }
    res.render("shop", {
        product: response.data, 
        type: response2.data,
        usedata:req.session.logindata});
});






//-------------------------------------------------------

app.get("/login",async(req, res) => {
     if (!req.session.logindata) {
        req.session.logindata = { 
            username: "",
            level: "user"  // เพิ่ม default value
        };
    }

    const response = await axios.get(base_url + '/users');
    res.render("login", {users : response.data});
});

app.post("/login",async(req, res) => {
    try{
    const data = {
        name:req.body.username,
        password:req.body.password
    }
    const response = await axios.post(base_url + '/login',data)
    if(response.data.message == "user not found"){
        console.log("user wrong");
        res.redirect("/login")
    }
    else if(response.data.message == "wrong password"){
        console.log("password wrong");
        res.redirect("/login")
    }
    else{
        req.session.logindata = {
            username: response.data.checkN.username,
            level: response.data.checkN.level,
            userid:response.data.checkN.userid
        }
        console.log(req.session.logindata)
        res.redirect("/shop");
    }
}catch(err){
    console.log(err);
    res.status(500).send("error");
}
});
app.get("/logout",(req, res) =>{
    try{
        req.session.logindata = null
        res.redirect("/login")
    }
    catch(err){
        console.log(err);
        res.status(500).send("error");
        res.redirect("/login")
    }
});


app.get("/Register",async(req, res) => {
    // ตรวจสอบว่า req.session.logindata มีค่าหรือไม่
    if (!req.session.logindata) {
        req.session.logindata = { 
            username: "",
            level: "user"  // เพิ่ม default value
        };
    }
    res.render("Register",{usedata:req.session.logindata}); 
});

app.post("/Register",async(req, res) => {
    const data = {
        username:req.body.username, 
        email:req.body.email,              
        password:req.body.password,     
        phone:req.body.phone,         
        userAdress:req.body.userAdress 
    }
    await axios.post(base_url + '/users',data)
    if (req.session.logindata.level == "admin"){
        return res.redirect("/Accouts");
    }else{
    return res.redirect("/shop");   
    }
});



//-------------------------------------------------------------



app.listen(5000, () => {                         // ตำแหน่งเข้าหน้าเว็บในที่นี่ตั้งเป็น Localhost:5000
    console.log('Sever started on post 5000');
});
        