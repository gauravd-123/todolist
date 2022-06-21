//jshint esversion:6


const express = require("express");
const bodyParser = require("body-parser");
//
const mongoose = require("mongoose");

const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//making a new todolistDB and connecting it to this site
// mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://Gaurav:Education777&@cluster0.g8gn6dj.mongodb.net/todolistDB");


//making new schema with a name of type String
const itemSchema = {
  name:String
};

//making a collection named Item for our itemSchema
const Item = mongoose.model("Item", itemSchema);

//making 3 documents
const item1 = new Item({
  name:"Welcome"
});

const item2 = new Item({
  name:"Hit +"
});

const item3 = new Item({
  name:"Bye"
});

//putting these documents inside defaultItems array
const defaultItems = [item1, item2, item3];

//List Schema

const listSchema = {
  name: String,
  items: [itemSchema]
};

//List model
const List = mongoose.model("List", listSchema);




// Item.deleteMany({name:"Hit +"}, function(err){
//   if(err){
//     console.log(err);
//   } else {
//     console.log("Successfully deleted!");
//   }
// });
// Fruit.save()
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();

    Item.find({}, function(err, foundItems){

      if(foundItems.length === 0){
          // inserting into our db the array defaultItems
          Item.insertMany(defaultItems, function(err){
            if(err){
              console.log(err);
            } else {
              console.log("Successfully inserted!");
            }
          });
          res.redirect("/")
        } else {
          res.render("list", {listTitle: "Today"/*day*/, newListItems: foundItems});

        }
      });

    });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  //if the listName user enters === Today then we redirect to home route
  //else we find that custom list and add that new item in that list and
  // then we redirect to the listname route i.e line 130
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   defaultItems.push(item);
  //   res.redirect("/");
  // }
});


/////////////////////////////////////////////////////
//to delete an item
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("Successfully deleted checked item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      {name: listName}, 
      {$pull:{items: {_id: checkedItemId}}}, 
      function(err, foundList){
        if(!err){
          res.redirect("/" + listName);
        }
      });
  }

 
});
//////////////////////////////////////////////


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

////////////////////////////////////////////////////////////////////////
//Don't change this line
app.get("/:customListName",function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
        // console.log("Doesn't exist");
    } else {
      //show an existing list
      res.render("list", {listTitle: foundList.name /*day*/, newListItems: foundList.items});
      // console.log(customListName+" exists");
    }
  }
  });

});
////////////////////////////////////////////////////////////////////////




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000....");
});
