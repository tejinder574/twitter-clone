const mongoose = require('mongoose')
const Post = new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Userdata'
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type: String,
        required:true,
    },
    likes:{
        type:Number,
        default:0,
    },
},
{collection:'Postdata'})
const model=mongoose.model('Postdata',Post)
module.exports=model;