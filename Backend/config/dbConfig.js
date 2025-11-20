// const mongoose= require("mongoose");
// const URL= process.env.MONGO_DB_URL;
// const URL_WITH_PASSWORD = URL.replace("<db_password>",process.env.MONGO_DB_PASSWORD);
// const URL_WITH_PASSWORD_AND_DB_NAME = URL_WITH_PASSWORD.replace("/?",`/${process.env.MONGO_DB_DATABASE_NAME}?`);

// const connectToDb = async () => {
//     try {
//         await mongoose.connect(URL_WITH_PASSWORD_AND_DB_NAME);
//         console.log("--------- MONGO_DB CONNECTED ---------");
//     } catch (err) {
//         console.log("------ MONGO_DB NOT CONNECTED --------");
//         console.log(err.message);
//     }
// };

// connectToDb(); 


const mongoose = require("mongoose");

const MONGO_DB_URL = process.env.MONGO_DB_URL;

if (!MONGO_DB_URL) {
    console.error("❌ Missing MongoDB environment variables!");
    process.exit(1);
}

console.log("🔍 Connecting to MongoDB:", MONGO_DB_URL); // Debugging

const connectToDb = async () => {
    try {
        await mongoose.connect(MONGO_DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MONGO_DB CONNECTED");
    } catch (err) {
        console.error("❌ MONGO_DB CONNECTION FAILED:", err.message);
        process.exit(1);
    }
};

connectToDb();
