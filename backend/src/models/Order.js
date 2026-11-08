import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  tableNumber: { type: String, default: "Takeaway", trim: true },
  notes: { type: String, default: "", maxlength: 500 },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Pending", "Preparing", "Ready", "Completed", "Cancelled"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
