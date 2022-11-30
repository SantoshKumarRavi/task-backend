const express = require("express");
const task = require("../db_model/task_db");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
const mongoose = require("mongoose");

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

async function main() {
  await mongoose.connect("mongodb://localhost:27017/tasks");
}
main()
  .catch((err) => console.log(err))
  .then(() => console.log("db connected"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/v1/tasks", (req, res) => {
    console.log()
    if(req.body.tasks){

        const arr =req.body.tasks;
        task.insertMany(arr, function(error, docs) {
            if(error){
                console.log(error)
                return
            }
            if(docs){
                let ids=[]
                docs.forEach((x)=>{
                    ids.push(x._id)
                })
                res.send(JSON.stringify({ message: "bulk post created ", tasks:ids}));
            }
        });

    }else{
        const savedtask = new task(req.body);
        savedtask.save(function (err, data) {
          if (err) {
            console.log(err);
            return;
          }
          // saved!
          if (data) {
            res.send(JSON.stringify({ message: "post created ", id: data._id }));
          } else {
              res.status(400).send('Bad Request')
          }
        });

    }

});
app.get("/v1/tasks",(req,res)=>{
    task.find({}).then((x)=>{
        res.send(JSON.stringify({ message: "post fetched ",data:x }));
    })
})
app.get("/v1/tasks/:id",(req,res)=>{
        var objectId = mongoose.Types.ObjectId(req.params.id);
        task.find({_id:objectId}).then((ele)=>{
            console.log(ele)
            if(ele.length==0){
                res.status(400).send(JSON.stringify({ error: "There is no task at that id"}));
                return
            }
            res.send(JSON.stringify({ message: "post fetched ",data:ele }));
        })
        // res.send(JSON.stringify({ message: "post fetched id "}));
})

app.delete("/v1/tasks/:id",async(req,res)=>{
    var objectId = mongoose.Types.ObjectId(req.params.id);
    task.deleteOne({_id:objectId}).then((ele)=>{
        // console.log(ele)
        res.status(200).send(JSON.stringify({ message: `${ele.deletedCount} count deleted`}));
    })
})

app.delete("/v1/tasks",async(req,res)=>{
    if(req.body.tasks){
        let deletearray=req.body.tasks
        deletearray=deletearray.map((strid)=>mongoose.Types.ObjectId(strid))
        // console.log(deletearray)
        await task.deleteMany({_id:{$in:deletearray}}).then((x)=>{
            if(x.deletedCount==0){
                res.status(404).send(JSON.stringify({ message:` No ids found to  delete`}));

            }else{
                res.status(200).send(JSON.stringify({ message:` bulk tasks deleted`}));
            }
        });
    }

})

app.put("/v1/tasks/:id",(req,res)=>{
    var objectId = mongoose.Types.ObjectId(req.params.id);
    task.updateOne({_id:objectId},req.body).then((ele)=>{
        console.log(ele)
        if(ele.matchedCount==0){
            res.status(404).send(JSON.stringify({ message: `id not found`}));  
            return
        }
        res.send(JSON.stringify({ message: "updated ",data:ele }));
    })
    // res.send(JSON.stringify({ message: "post fetched id "}));
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Character.deleteOne({ name: 'Eddard Stark' })