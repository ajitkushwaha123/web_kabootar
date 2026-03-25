import mongoose from "mongoose";

const catalogItemSchema = new mongoose.Schema(
  {
    organizationId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    
    // Variant Properties (e.g., Size: [Small, Medium, Large])
    variantGroups: [
      {
        name: { type: String, required: true }, // "Size"
        options: [{ type: String, required: true }], // ["Small", "Medium"]
      }
    ],

    // Combinations (e.g., { Size: "Small" } -> Price: 100)
    variantCombinations: [
      {
        values: { type: Map, of: String }, // { "Size": "Small" }
        price: { type: Number, required: true },
        isActive: { type: Boolean, default: true }
      }
    ],

    tags: [String],
    spiceLevel: {
      type: String,
      enum: ["none", "medium", "high"],
      default: "none"
    },
    isVeg: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true, versionKey: false }
);

const CatalogItem = mongoose.models.CatalogItem || mongoose.model("CatalogItem", catalogItemSchema);
export default CatalogItem;
