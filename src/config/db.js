import mongoose from "mongoose";

async function connectToDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected with database successfully");
    } catch(err){
        console.log("database connection failed!", err.message);
    }

}

export default connectToDB;