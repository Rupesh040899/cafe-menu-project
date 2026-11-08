export function validateMenuItem(req, res, next) {
  const { name, category, price } = req.body;
  if (!name || !String(name).trim()) return res.status(400).json({ success: false, message: "Item name is required" });
  if (!category || !String(category).trim()) return res.status(400).json({ success: false, message: "Category is required" });
  if (price === undefined || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ success: false, message: "Price must be a valid non-negative number" });
  }
  next();
}

export function validateOrder(req, res, next) {
  const { customerName, phone, items } = req.body;
  if (!customerName?.trim()) return res.status(400).json({ success: false, message: "Customer name is required" });
  if (!phone?.trim() || !/^[+0-9 ()-]{7,20}$/.test(phone)) return res.status(400).json({ success: false, message: "Enter a valid phone number" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: "Add at least one item to your order" });
  for (const item of items) {
    if (!item.menuItem || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      return res.status(400).json({ success: false, message: "Each item needs a valid menuItem ID and quantity" });
    }
  }
  next();
}
