import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Database Connected Successfully");
  });

  try {
    await mongoose.connect(`${process.env.MONGODB_URI}EcomDB`);
  } catch (error) {
    console.log("Database connection failed:", error);
    throw error;
  }
};

export default connectDB;
