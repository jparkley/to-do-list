
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");


const app = express();
app.set("view engine", "ejs");  // Template engine: EJS
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// connect to MongoDB and create the item Schema and an instance of it(model)
//mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://admin-jjin:test-jjin@cluster0.pis4s.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "Install Woocommerce"
});
const item2 = new Item ({
  name: "Install shipping zone plugin"
});
const item3 = new Item ({
  name: "Design LnF"
});
const defaultItems = [item1, item2, item3];

// Create a new schema / generate an instance of a new list document for a new custom router
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("default - success!!");
        }
      });
      res.render("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});


app.get("/:customListName", function(req, res){

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
          if (!err) {
            if(!foundList) {
              console.log("not there so create one");
              const list = new List({
                name: customListName,
                items: defaultItems
              });
              list.save(function(err, result) {
                res.redirect("/" + customListName);
              });

            } else {
              //console.log(foundList);
              res.render("list", {listTitle: foundList.name, newListItems:foundList.items});            }
          } else {
            console.log(err);
          }
      });
});


app.post("/", function(req, res) {

  const listName = req.body.list;
  const itemName = req.body.newItem;

  const item = new Item({
    name:itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {

    List.findOne({name: listName}, function(err, foundList){
      //console.log(foundList);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});




app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  //console.log(listName);

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err) {
        console.log("success in deleting");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {
      $pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }
});

app.get("/about", function(req, res) {
  res.render("about");
});

// app.listen(3000, function() {
//   console.log("server started on port 3000");
// });

app.listen(process.env.PORT || 3000, function() {
  console.log("server started");
});
