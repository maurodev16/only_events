import mongoose from "mongoose";

const openingHoursSchema = new mongoose.Schema({
    day_of_week: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holiday'],
      required: true,
    },
    opening_time: {
      type: String,
      required: true,
    },
    closing_time: {
      type: String,
      required: true,
    },
  });

  const OpeningHours = mongoose.model("OpeningHours", openingHoursSchema);

export default OpeningHours;
