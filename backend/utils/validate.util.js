import mongoose from "mongoose";

// "A@Gmail.com " -> "a@gmail.com"
export const normalizeEmail = (email) =>
    typeof email === "string" ? email.trim().toLowerCase() : "";

export const isValidEmail = (email) =>
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
