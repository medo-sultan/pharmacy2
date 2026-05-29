import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log(chalk.green("● Data Is Run Now Welcome to DB"));
    });

    mongoose.connection.on("disconnected", () => {
      console.log(chalk.red("MongoDB disconnected"));
    });

    mongoose.connection.on("error", (err) => {
      console.log(chalk.red("MongoDB Error:", err));
    });

    await mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.error(chalk.red("🔴 DB Connection Error:", error.message));
  }
};

export default connectDB;
