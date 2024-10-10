const mongoose = require('mongoose');

const connect = async() => {
    mongoose.connect(process.env.MONGO_URL, {

    })
    .then(()=>{ 
        console.log("DB Connection Successful");
    })
    .catch((error)=>{
        console.log("Error connecting to DB:", error);
    })
}

module.exports = connect;
