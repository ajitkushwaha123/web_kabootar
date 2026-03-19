import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    display_phone_number: {
      type: String,
      required: true,
      trim: true,
    },
    org_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phone_number_id: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);

export default Organization;
