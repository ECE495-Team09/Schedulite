import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema({ name: String }, { _id: false });

const EventSchema = new mongoose.Schema({
  title: String,
  startTime: Date,
  endTime: Date,
  location: String,
  description: String,
  groupId: String,
  invitationList: [PersonSchema],
  responses: {
    notResponded: [PersonSchema],
    in: [{ name: String, respondedAt: Date }],
    out: [{ name: String, respondedAt: Date }]
  }
});

export default mongoose.model("Event", EventSchema);