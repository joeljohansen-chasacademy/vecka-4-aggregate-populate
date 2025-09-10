// routes/exercises.js
import express from "express";
import mongoose from "mongoose";
import { Instrument } from "../models/models.js";
import { Brand } from "../models/models.js";
// import { Rep } from "../models/rep.model.js"; // Behövs ej just nu

export const exercisesRouter = express.Router();

/**
 * 1) GET /exercises/instruments/by-brand?name=Fender
 *    Krav: Hämta alla instrument vars brand.name matchar (case-insensitive).
 *    Returnera instrument inkl. brand + rep (populate).
 *    Hint: hitta brand._id via Brand.findOne({ name: /.../i }) och filtrera instruments på brand: brandId
 */
exercisesRouter.get("/instruments/by-brand", async (req, res) => {
	try {
		const name = String(req.query.name ?? "");
		// TODO: 1) Hitta brand via regex-match på name

		// TODO: 2) Hämta instrument för brand._id och populate brand->rep

		res.json([]); // Byt till 'out' när implementerat
	} catch (e) {
		console.error("[/exercises/instruments/by-brand] error:", e);
		res.status(500).json({ error: "Failed to fetch instruments by brand" });
	}
});

/**
 * 2) GET /exercises/instruments/paged?skip=0&limit=10&sort=price
 *    Krav: Paginera och sortera (t.ex. sort=price eller sort=-price). Inkludera brand->rep (populate).
 *    Hint: .find().sort(sortObj).skip(skip).limit(limit).populate(...).lean()
 */
exercisesRouter.get("/instruments/paged", async (req, res) => {
	try {
		// TODO: Hämta, populera och gör gärna validering på skip, limit och sort.

		res.json([]); // Byt till 'out' när implementerat
	} catch (e) {
		console.error("[/exercises/instruments/paged] error:", e);
		res.status(500).json({ error: "Failed to fetch paged instruments" });
	}
});

/**
 * 3) GET /exercises/stats/avg-price-by-kind
 *    Krav: Returnera [{ kind, avgPrice }] via aggregation.
 *    Hint: $project { kind, priceNum: { $toDouble: "$price" } } -> $group by kind med $avg -> $project -> $sort
 */
exercisesRouter.get("/stats/avg-price-by-kind", async (_req, res) => {
	try {
		const pipeline = [
			// TODO: $project
			// TODO: $group
			// TODO: $project
			// TODO: $sort
		];
		const out = await Instrument.aggregate(pipeline);
		res.json(out);
	} catch (e) {
		console.error("[/exercises/stats/avg-price-by-kind] error:", e);
		res.status(500).json({ error: "Failed to compute avg price by kind" });
	}
});

/**
 * 4) GET /exercises/stats/brand-inventory
 *    Krav: Returnera [{ brand, count, totalValue }] där totalValue = sum(price * amountInStock) per brand.
 *    Hint: $lookup brands -> $unwind -> $project { brand, value } -> $group -> $project -> $sort
 */
exercisesRouter.get("/stats/brand-inventory", async (_req, res) => {
	try {
		const pipeline = [
			// TODO: $lookup
			// TODO: $unwind
			// TODO: $project
			// TODO: $group
			// TODO: $project
			// TODO: $sort
		];
		const out = await Instrument.aggregate(pipeline);
		res.json(out);
	} catch (e) {
		console.error("[/exercises/stats/brand-inventory] error:", e);
		res.status(500).json({ error: "Failed to compute brand inventory stats" });
	}
});

export default exercisesRouter;
