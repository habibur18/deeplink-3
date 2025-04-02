import mongoose from "mongoose"

const ClickDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  deviceType: {
    type: String,
    enum: ["desktop", "mobile", "tablet"],
    default: "desktop",
  },
  referrer: {
    type: String,
    default: "",
  },
  ip: {
    type: String,
    default: "unknown",
  },
  userAgent: {
    type: String,
    default: "",
  },
})

const LinkSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    customSlug: {
      type: Boolean,
      default: false,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    domain: {
      type: String,
      default: "",
    },
    clicksData: [ClickDataSchema],
  },
  { timestamps: true },
)

// Create a compound index for slug and domain
LinkSchema.index({ slug: 1, domain: 1 }, { unique: true })

// Check if the model is already defined to prevent overwriting during hot reloads
const Link = mongoose.models.Link || mongoose.model("Link", LinkSchema)

export default Link

