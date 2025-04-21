const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema({
  CallId: {
    type: Number,
    required: true,
    unique: true
  },
  PHONENO: {
    type: String,
    required: true
  },
  CallSummary: {
    type: String,
    required: true
  },
  Outcome: {
    type: String,
    enum: ["positive", "negative", "neutral"],
    required: true
  },
  TimeStamp: {
    type: Date,
 
  }
});

module.exports = mongoose.model("CallLog", callLogSchema, "call_log");
