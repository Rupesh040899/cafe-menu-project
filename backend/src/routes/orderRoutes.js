import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import { validateOrder } from "../middleware/validate.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Customer order management
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place a customer order
 *     tags: [Orders]
 *     responses:
 *       201: { description: Order created }
 */
router.post("/", validateOrder, async (req, res, next) => {
  try {
    const ids = req.body.items.map(item => item.menuItem);
    if (ids.some(id => !mongoose.isValidObjectId(id))) return res.status(400).json({ success: false, message: "One or more menu item IDs are invalid" });
    const menuItems = await MenuItem.find({ _id: { $in: ids }, available: true });
    const itemMap = new Map(menuItems.map(item => [item.id, item]));
    const orderItems = req.body.items.map(line => {
      const menuItem = itemMap.get(String(line.menuItem));
      if (!menuItem) throw Object.assign(new Error("A selected menu item is unavailable"), { status: 400 });
      return { menuItem: menuItem._id, name: menuItem.name, quantity: Number(line.quantity), price: menuItem.price };
    });
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      customerName: req.body.customerName,
      phone: req.body.phone,
      tableNumber: req.body.tableNumber || "Takeaway",
      notes: req.body.notes || "",
      items: orderItems,
      totalAmount
    });
    res.status(201).json({ success: true, message: "Order placed successfully", data: order });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get recent orders
 *     tags: [Orders]
 *     responses:
 *       200: { description: Orders returned }
 */
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.phone) filter.phone = req.query.phone;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     responses:
 *       200: { description: Status updated }
 */
router.patch("/:id/status", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const allowed = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid order status" });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});

export default router;
