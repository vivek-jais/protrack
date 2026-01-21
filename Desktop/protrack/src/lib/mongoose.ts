import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("✅ Using existing database connection");
      return;
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    console.log("⏳ Connecting to MongoDB...");
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("🚀 Database Connected Successfully!");
    
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
  }
};

export default connectDb;