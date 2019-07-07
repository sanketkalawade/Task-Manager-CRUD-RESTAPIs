const express = require('express');
const Task = require('../models/tasksModel');
const authMiddleware = require('../middleware/authMiddleware');

const taskRouter = new express.Router();


//tasks rest apis

//create task
taskRouter.post('/tasks',authMiddleware, async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        const result = await task.save();
        res.status(201).send(result)
    } catch (error) {
        res.status(400).send(error)
    }

    // task.save()
    //     .then(result=>{res.status(200).send(result)})
    //     .catch(error=>{res.status(500).send(error)})
    
})

//get all tasks
taskRouter.get('/tasks',authMiddleware,async (req,res)=>{

    try {
        console.log(req.user.id);
        
        const allTasks = await Task.find({ owner:req.user.id });
        //OR
        // await req.user.populate('userTasks').execPopulate();

        if (!allTasks) {
            return res.status(404).send("No tasks available,Create one")
        }
        res.send(allTasks)
    } catch (error) {
        res.status(500).send(error);
    }

    // Task.find({}).then(allTasks=>{
    //     if (!allTasks) {
    //         return res.status(404).send("No tasks available")
    //     }
    //     res.send(allTasks)
    // }).catch(error=>{
    //     res.status(500).send(error)
    // })
})

//get perticuler task by id
taskRouter.get('/tasks/:id',authMiddleware, async (req,res)=>{
    const _id = req.params.id;
    try {
        //const result = await Task.findById(_id);
        const result = await Task.findOne({_id, owner:req.user._id})
        if (!result) {
            return res.status(404).send("No such task available");
        }        
        res.send(result)
    } catch (error) {        
        res.send(error)
    }

    // Task.findById(_id).then(result=>{
    //     if (!result) {
    //         return res.status(404).send("No such a task available")
    //     }
    //     res.send(result)
    // }).catch(error=>{
    //     res.status(500).send(error)
    // })
})

//update task by its id
taskRouter.patch('/tasks/:id', authMiddleware , async (req,res)=>{
    const _id = req.params.id;
    const allowedUpdates = ['description','completed']
    const updatesByuser = Object.keys(req.body);
    const isValidOperation = updatesByuser.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send("Error: Invalid Operation");
    }

    try {
        //const updatedTask = await Task.findByIdAndUpdate(_id, req.body, {new:true, runValidators:true});
        const task = Task.findOne({_id:_id, owner:req.user._id});
       
        
        if (!task) {
            return res.status(404).send("No task with such id");
        }


        allowedUpdates.forEach(update=>task[update] = req.body[update])
        task.save();
        res.send(task)
    } catch (error) {
        res.status(400).status(error)
    }
})

//delete task by its id
taskRouter.delete('/tasks/:id', authMiddleware , async (req,res)=>{
    const _id = req.params.id;
    try {
        const deletedTask = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id});
        if (!deletedTask) {
            return res.status(404).send("No such task available to delete")
        }
        res.send(deletedTask)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = taskRouter;