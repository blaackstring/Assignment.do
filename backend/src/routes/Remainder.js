import cron from "node-cron";
import Habit from "../models/Habit.js";
import { SendMail } from "./Verification.js";
import CheckIn from "../models/CheckIn.js";

// ⏰ Runs every minute
export const task = cron.schedule("* * * * *", async () => {
  const date = new Date();
  // Format time as HH:MM (24-hour)
  const currentTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" , hour12: false });

  console.log("Checking reminders at", currentTime);

  const habits = await Habit.find({
    reminder: true,
    reminderTime: currentTime,
    isCompletedToday: false,
    reminderSent: false,
  });


  

  for (const habit of habits) {
    await SendMail(habit.userId, habit.name);

    habit.reminderSent = true;
    await habit.save();
  }
});

// 🔄 Daily reset at midnight
export const dailyResetTask = cron.schedule("0 0 * * *", async () => {


  await Habit.updateMany({}, { 
    isCompletedToday: false, 
    reminderSent: false 
  });
  console.log("Daily reset done ✅");
});
