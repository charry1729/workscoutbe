const schedule = require("node-schedule");
const User = require('../models/users');
const Profile = require("../models/profile");
const Job = require("../models/jobs");
const JobApplication = require("../models/jobApplications")


`
CRON hierarchy with valid ranges

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
`

let i=1;

schedule.scheduleJob("test",'* * * * *', function(){
    console.log('The answer to life, the universe, and everything! '+i);
    i++;
  });


// Daily scheduler to check for expired jobs

schedule.scheduleJob('expireJob','1 0 * * *',function(){
    
})


// Montly scheduler to add free resumedownloadlimit to recruiter

schedule.scheduleJob('addFreeLimit','1 0 1 * *',function(){
    User.updateMany(
        {
            userType:'recruiter'
        },
        {
            $inc:{
                resumedownloadlimit : 3,
            }
        },
        function(err,doc){
            if(err){
                console.log("Free Limit Scheduler Failed")
            }
            if(doc){
                console.log('Free Limit Scheduler executed');
            }
        }
    )
    
})

