import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    customerPhone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    tags: [String],
    location: {
      city: String,
      state: String,
      country: String,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    extraData: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
