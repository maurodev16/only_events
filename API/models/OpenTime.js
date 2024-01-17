import mongoose from "mongoose";

const openingHoursSchema = new mongoose.Schema({
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Holiday'],
      required: true,
    },
    openingTime: {
      type: String,
      required: true,
    },
    closingTime: {
      type: String,
      required: true,
    },
  });

  const OpeningHours = mongoose.model("OpeningHours", openingHoursSchema);

export default OpeningHours;
