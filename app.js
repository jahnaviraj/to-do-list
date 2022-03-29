const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Make database
mongoose.connect(
  "mongodb+srv://jahnavi-raj:DU_gauri25@cluster0.vu3w9.mongodb.net/todolistDB"
);
// Make schema
const itemsSchema = {
  name: String,
};
// Make model
const Item = mongoose.model("Item", itemsSchema);

// Default items
const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item.",
});
const item3 = new Item({
  name: "Hit this to delete an item -->",
});

defaultItems = [item1, item2, item3];

// List schema
const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  // Get items from db
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      // empty array
      // only then save default data
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", items: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  // new item doc
  const newItem = Item({
    name: itemName,
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    // search for list in db
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.get("/:listName", function (req, res) {
  const customListName = _.capitalize(req.params.listName);
  // Check if list alrdy exists
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (foundList) {
        // show existing list
        res.render("list", {
          listTitle: customListName,
          items: foundList.items,
        });
      } else {
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      }
    } else {
      console.log(err);
    }
  });
});

app.post("/work", function (req, res) {
  const workItem = req.body.newItem;
  workItems.push(workItem);
  res.redirect("/work");
});

// delete route
app.post("/delete", function (req, res) {
  const delItemId = req.body.delete;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndDelete(delItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted successfully!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: delItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.listen(8000, function () {
  console.log("Server started on port 8000");
});
