
import { Router } from "express";
import mongoose from "mongoose";
import MenuItem from "../models/MenuItem.js";
import { validateMenuItem } from "../middleware/validate.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Cafe menu management
 */

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Get all menu items
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter menu by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search menu items by name
 *     responses:
 *       200:
 *         description: Menu items returned successfully
 */
router.get("/", async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.name = {
        $regex: req.query.search,
        $options: "i"
      };
    }

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/menu:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cappuccino
 *               description:
 *                 type: string
 *                 example: Fresh espresso with steamed milk and creamy foam.
 *               category:
 *                 type: string
 *                 example: Coffee
 *               price:
 *                 type: number
 *                 example: 160
 *               image:
 *                 type: string
 *                 example: https://example.com/cappuccino.jpg
 *               available:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Menu item created successfully
 *       400:
 *         description: Invalid menu item data
 */
router.post("/", validateMenuItem, async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: item
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     summary: Get menu item by ID
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item returned
 *       400:
 *         description: Invalid item ID
 *       404:
 *         description: Menu item not found
 */
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID"
      });
    }

    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/menu/{id}:
 *   put:
 *     summary: Update an existing menu item
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cafe Latte
 *               description:
 *                 type: string
 *                 example: Smooth espresso with steamed milk.
 *               category:
 *                 type: string
 *                 example: Coffee
 *               price:
 *                 type: number
 *                 example: 170
 *               image:
 *                 type: string
 *               available:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 *       400:
 *         description: Invalid item data or ID
 *       404:
 *         description: Menu item not found
 */
router.put("/:id", validateMenuItem, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID"
      });
    }

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.json({
      success: true,
      message: "Menu item updated successfully",
      data: item
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/menu/{id}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 *       400:
 *         description: Invalid item ID
 *       404:
 *         description: Menu item not found
 */
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID"
      });
    }

    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.json({
      success: true,
      message: "Menu item deleted successfully"
    });

  } catch (error) {
    next(error);
  }
});

export default router;
