import mongoose from "mongoose";

const connect_Db = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected:', mongoose.connection.host);
    } catch (error) {
        console.error("Error from config_db:", error);
        process.exit(1);
    }
}

export default connect_Db;