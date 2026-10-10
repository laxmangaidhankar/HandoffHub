const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    // Public identifier used in the room URL
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    // Name entered by the room creator
    roomName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 40,
    },
   
    accessKeyHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },

    // Current room state
    status: {
      type: String,
      enum: ["active", "expired", "destroyed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired rooms from MongoDB
roomSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("Room", roomSchema);