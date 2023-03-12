const express = require('express');
const port = 3000;
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyparser = require('body-parser')
const User = require("./model/users")
const Post = require("./model/posts")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator");
const fetchUserid = require('./middleware/fetchUserid');

const JWT_SECRET_KEY = "shhhhhhh";


// mongodb+srv://TejinderSingh:<password>@cluster0.pvfsgkn.mongodb.net/?retryWrites=true&w=majority
//pw-Tejinder123
const mongo = "mongodb://localhost:27017/Twitter"

app.use(cors());
app.use(bodyparser.json())

app.get('/', (req, res) => {
    res.send('hello world');
})


// User login and signup routes

app.post('/register', [
    body('name', 'Enter the valid name of length more than 4 characters').isLength({ min: 4 }),
    body('email', 'Enter the valid Email').isEmail(),
    body('password', 'Enter the valid password of length more than 4 characters').isLength({ min: 5 })
], async (req, res) => {

    try {

        const { name, email, password } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ status: false, error: errors.array() });
        }

        const emailcheck = await User.findOne({ email });

        if (emailcheck) {
            return res.json({ status: false, message: "Email already exists!" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        const data = {
            user: {
                id: user.id
            }
        }

        const AuthToken = jwt.sign(data, JWT_SECRET_KEY)


        return res.json({ status: true, user, AuthToken })
    }
    catch (err) {
        // console.log(err);
        res.status(400).json({ status: 'error', error: err });
    }
})


app.post('/login', [
    body('email', 'Please enter valid email').isEmail(),
    body('password', 'Please enter valid password').isLength({ min: 4 })
], async (req, res) => {
    try {

        const error = validationResult(req)


        if (!error.isEmpty()) {
            return res.status(400).json({ error: error.array() })
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }

        const isPasswordvalid = await bcrypt.compare(password, user.password);

        if (!isPasswordvalid) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const Authtoken = jwt.sign(data, JWT_SECRET_KEY)


        return res.status(200).json({ status: true, user, Authtoken })

    }
    catch (err) {
        return res.json({ status: false, error: err })
    }
})


// delete user account

app.delete('/deleteuser', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }

        const isPasswordvalid = await bcrypt.compare(password, user.password);

        if (!isPasswordvalid) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }


        await User.remove({ email }).then(() => {
            return res.json({ status: true, message: "Account Delete Successfully" })
        }).catch((err) => {
            return res.json({ status: false, error: err })

        })


    }
    catch (err) {
        return res.json({ status: false, error: err })
    }
})


// delete any user account by admin


app.delete('/admindelete', async (req, res) => {
    try {
        const { adminemail, password, useremail } = req.body;

        const user = await User.findOne({ email: adminemail })

        if (!user) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }
        const isPasswordvalid = await bcrypt.compare(password, user.password);

        if (!isPasswordvalid) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }

        if (user.admin === "no") {
            return res.json({ status: false, message: "You are not a admin" })
        }

        await User.remove({ useremail }).then(() => {
            return res.json({ status: true, message: "Account Delete Successfully" })
        }).catch((err) => {
            return res.json({ status: false, error: err })

        })


    }
    catch (err) {
        return res.json({ status: false, error: err })
    }
})



// get all users


app.get('/allusers', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }

        const isPasswordvalid = await bcrypt.compare(password, user.password);

        if (!isPasswordvalid) {
            return res.json({ status: false, message: "Invalid Crendentials" })
        }

        if (user.admin === "no") {
            return res.json({ status: false, message: "You are not a admin" })
        }


        const users = await User.find({})
        if (!user) {
            return res.json({ status: false, message: "Your Database is Empty" })
        }

        return res.json({ status: true, users })

    }
    catch (err) {
        return res.json({ status: false, error: err })
    }
})









// Post Routes

app.post('/addpost', fetchUserid, [
    body('title', "Enter a Valid title").isLength({ min: 1 }),
    body('description', 'Enter a Valid desscription').isLength({ min: 1 })
], async (req, res) => {

    try {

        const post_errors = validationResult(req.body);

        if (!post_errors.isEmpty()) {
            return res.status(401).json({ error: post_errors.array() })
        }



        const { title, description } = req.body;

        const post = new Post({
            title, description, userid: req.user.id
        })

        const saveNote = await post.save();



        return res.json({ status: true, saveNote})
    }
    catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
    }
})



app.get('/getallposts',fetchUserid, async(req,res)=> {
    try{
        const posts = await Post.find({});

        res.json(posts);
    }
    catch(error){
        res.status(500).send("Internal Server Error")
    }
})


app.get('/getuserposts',fetchUserid, async(req,res)=> {
    try{
        const posts = await Post.find({userid:req.user.id});

        res.json(posts);
    }
    catch(error){
        res.status(500).send("Internal Server Error")
    }
})


app.delete('/deletepost/:id',fetchUserid,async(req,res)=>{
    try{
        let post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).send("Not Found")
        }
        if(post.userid.toString() != req.user.id){
            return res.status(401).send("Not allowed")
        }

        post = await Post.findByIdAndDelete(req.params.id);

        res.json({status: true,msg:"Post has been Deleted", post})
    }

    catch(error){
        return res.status(500).send("Internal Server Error")
    }
})




app.listen(port, () => { console.log(`server running at http://localhost:${port}`) });

mongoose.connect(mongo, { useUnifiedtopology: true, useNewUrlParser: true })
    .then((data) => { console.log("database connected succesfully") })
    .catch(err => console.error(err));
