//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://baichuany:Ybc20000920@cluster0.3rnhq.mongodb.net/todolistDB', {useNewUrlParser: true});


const itemSchema = new mongoose.Schema({
  name: String
})
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model("List", listSchema);
const homework = new Item({ name: 'Homework'});
const cooking = new Item({ name: 'Cooking'});
const dishwashing = new Item({ name: 'Dishwashing'});



app.get("/", function(req, res) {
  Item.find({}, function(err, items) {
    // if (items.length === 0){
    //   Item.insertMany([homework, cooking, dishwashing], function(err) {
    //     if (err){
    //         console.log(err);
    //     }
    //     else {
    //         console.log("Successfully inserted!");
    //         res.redirect('/')
    //     }
    //   });
     
    // } 
    // else {
      res.render("list", {listTitle: "Today", newListItems: items});
    // }   
  })
});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const newItem = new Item({ name: item});

  const listName = req.body.list
  
  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(newItem);
      foundList.save()
      res.redirect('/'+foundList.name)
    })
  }
});

app.post("/delete", function(req, res){

  const listName = req.body.listName;
  if (listName === "Today"){
    Item.deleteMany({_id:req.body.checkbox}, function(err){
      if (!err) {
        console.log("Successfully deleted!");
        res.redirect("/")
      }
    }) 
  }
  else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: req.body.checkbox}}}, function(err, foundList){
      if (!err) {
        res.redirect('/'+listName);
      }
    })
  }

  
});

app.get("/:route", function(req, res){
  List.findOne({name: req.params.route}, function(err, foundList){
    if (!err) {
      // if no list is found, create a new list
      if (!foundList) {
        const list = new List({name: req.params.route, items:[homework, cooking, dishwashing]})
        list.save();
        res.redirect('/'+req.params.route)
      }
      // otherwise display the existing list
      else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
