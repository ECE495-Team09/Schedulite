import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema({ name: String }, { _id: false });

const EventSchema = new mongoose.Schema({
  title: String,
  startTime: Date,
  endTime: Date,
  location: String,
  description: {
    type: String,
    required: false,
  },
  groupId: String,
  invitationList: [PersonSchema],
  responses: {
    type: {
    notResponded: [PersonSchema],
    in: [{ name: String, respondedAt: Date }],
    out: [{ name: String, respondedAt: Date }]
    },
    required: false
  }
});

export default mongoose.model("Event", EventSchema);