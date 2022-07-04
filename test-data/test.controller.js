const express = require("express");
const router = express.Router();
const editJsonFile = require("edit-json-file");
const {db} = require("./../db/connection.js");

// routes
router.get("/read-files", readFilesTest); // public route

module.exports = router;

function readFilesTest(req, res, next) {

    var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";
    db.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });

    //let file = editJsonFile(`${__dirname}/foo.json`);
    // file = editJsonFile(`${__dirname}/foo.json`, {
    //     autosave: true
    // });

    //Create or append to an array
    //file.set("class_room", { class: "Computer Science", where: "KULeuven" });
    //You can even append objects
    //file.append("classes", { class: "Computer Science", where: "KULeuven" });
    //console.log(file.get().classes);
    //file.append();
    //file.set("classes", "fysics");
   // file.append(file.get().classes, { class: "Computer Science", where: "KULeuven" });
    //file.save();

    //file.append("classes", "fysics");
    //You can even append objects
    //file.append("classes", { class: "Computer Science", where: "KULeuven" });
     
    //file.append('table', 'test1');
    // file.set("a.new.field.as.object", {
    //     hello: "world"
    // });
    res.json({
        status: true,
        test: "testing data"
    });
    /*
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
    */
}
