import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function requirePassword() {
        return !this.oidcSub;
      },
      minlength: 8,
      select: false,
    },
    oidcIssuer: {
      type: String,
      trim: true,
    },
    oidcSub: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin", "support"],
      default: "customer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.index(
  { oidcIssuer: 1, oidcSub: 1 },
  { unique: true, sparse: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
