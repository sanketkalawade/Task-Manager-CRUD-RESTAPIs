//basic crud operations

// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID;

//OR use destructuring

const {MongoClient, ObjectID} = require('mongodb');



const connectionURL = 'mongodb://127.0.0.1:27017';//127.0.0.1 is localhost ip. Use Ip instead of typing localhost bcz it causes strange errors.
const databaseName = 'task-manager-database';

MongoClient.connect(connectionURL,{useNewUrlParser:true}, (error,client)=>{
    if (error) {
        return console.log('unable to connect to mongodb DATABASE');
    }
    const db = client.db(databaseName);

    /*Create or Insert  in DB code started here */

            // db.collection('users').insertOne({
            //     name:'chaitanya randhe',
            //     age:24
            // })

            // db.collection('tasks').insertMany([
            //     {
            //         description:'html,css and sass',
            //         completed:false
            //     },
            //     {
            //         description:'node js',
            //         completed:false
            //     },
            //     {
            //         description:'advance javascript',
            //         completed:true
            //     }
            // ],(error,result)=>{
            //     if (error) {
            //         return console.log(error);
            //     }
            //     console.log(result.ops);
                
            // })

    /*Create or Insert code ends here */

    /*--------------------------------------------------------------------*/

    /*Fetch or Read data from DB starts here*/

                // db.collection('tasks').findOne({_id:new ObjectID("5d19f96e2758200e02a9841b")},(error,task)=>{
                //     console.log("Last task added was:- ");
                //     console.log(task);
                // })

                // db.collection('tasks').find({completed:false}).toArray((error,tasks)=>{
                //     console.log("tasks which are not completed:- ");
                //     console.log(tasks);
                // })

    /*Fetch or Read data from DB ends here*/

    /*--------------------------------------------------------------------*/


    /*update document code starts here */

        // db.collection('users').update({_id:new ObjectID("5d1a02e81ae9cb302a731370")},
        // {
        //     $inc:{
        //         age:-1
        //     }
        // }).then((result)=>{
        //     console.log(result);
        // }).catch((error)=>{
        //     console.log(error);
        // })


        // db.collection('tasks').updateMany({completed:false},{
        //     $set:{
        //         completed:true
        //     }
        // }).then((result)=>{console.log("Modified count: ",result.modifiedCount)}).catch((error)=>{console.log("Error: ",error)})

    /*update document code ends here */

    /*--------------------------------------------------------------------*/

    /*Delete feild from document code starts here */

        db.collection('users').deleteMany({age:24}).then((result)=>{
            console.log(result.deletedCount);
        }).catch((error)=>{console.log(error);})





    /*Delete feild from document code ends here */













})

