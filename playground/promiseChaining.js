require('../src/db/mongoose');
const Task = require('../src/models/tasksModel');


//promise chaining
// Task.findByIdAndDelete("5d1c16d374ca7ade448820ff").then(result=>{
//     console.log(result);
//     return Task.countDocuments({completed:false})
// }).then(count=>{
//     console.log(count);
// }).catch(e=>{
//     console.log(e);
// })



//Async await

const removeTaskAndListIncompleteTask = async (idToremove)=>{
    const removedTask = await Task.findByIdAndDelete(idToremove);
    const countOfIncompleteTask = await Task.countDocuments({completed:false});
    return {removedTask,
        countOfIncompleteTask}
}

removeTaskAndListIncompleteTask('5d1c895425b65f1b29d3eb4f').then(result=>{
    console.log(result);
}).catch(error=>{console.log(error);
})