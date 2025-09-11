//npm i express dotenv mongoose
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { Instrument, Brand, Rep } from "./models/models.js";
import { exercisesRouter } from "./routes/excercises.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use("/exercises", exercisesRouter);

// REST endpoints
app.get("/instruments", async (req, res) => {
	try {
		const instruments = await Instrument.find().populate({
			path: "brand",
			populate: { path: "rep" },
		});
		res.json(instruments);
	} catch (error) {
		console.error("[/instruments] error:", error); // <- viktig
		res.status(500).json({ error: "Failed to fetch instruments" });
	}
});

app.get("/instruments/agg", async (req, res) => {
	const pipeline = [
		{
			$lookup: {
				from: "brands",
				localField: "brand",
				foreignField: "_id",
				as: "brand",
			},
		},
		{ $unwind: "$brand" },
		{
			$lookup: {
				from: "reps",
				localField: "brand.rep",
				foreignField: "_id",
				as: "rep",
			},
		},
		{ $set: { "brand.rep": { $first: "$rep" } } },
		{ $unset: "rep" },
	];
	const docs = await Instrument.aggregate(pipeline);
	res.json(docs);
});

// ---------------- Övningar

/**
 * GET /instruments/total-stock-value -> behöver aggregation
 */
app.get("/instruments/total-stock-value", async (_req, res) => {
	try {
		const out = await Instrument.aggregate([
			{
				/**  Steg 1: $project ->
				 * Med project kan vi välja fält vi vill ha ut
				 * eller skapa nya egna fält. (se under extras)
				 * I denna project skulle vi kunna skapa ett nytt
				 * fält som heter value och i det fältet kan vi köra
				 * ett uttryck (exempelvis $multiply) för att räkna ut det totala värdet
				 * //Förväntat resultat ungefär:
				 * [
				 *   {
				 *     _id: ObjectId("..."),
				 *     name: "Telecaster",
				 *     price: 1200,
				 *     amountInStock: 5,
				 *     value: 6000
				 *   },
				 *   ...
				 * ]
				 */
			},
			{
				/**  Steg 2: $group
				 * Nu har vi en lista med alla instrument där vi har ett nytt fält som heter
				 * "value" under varje instrument och det fältet vill vi nu summera för alla instrument
				 * Med group kan vi gruppera ALLA instrument genom att sätta _id: null
				 * och sen skapa ett nytt värde som heter "total" ex. där vi gör själva
				 * summeringen med $sum
				 * Förväntat resultat ungefär: [{_id:null, total:134803498}]
				 */
			},
		]);
		res.json({ total: out[0]?.total ?? 0 });
	} catch (error) {}
});

/**
 * GET /instruments/stock-by-brand
 */
app.get("/instruments/stock-by-brand", async (_req, res) => {
	try {
		const out = await Instrument.aggregate([
			{
				// Steg 1: $lookup - hitta alla brands
				//Förväntat resultat ungefär: { name: "Telecaster", brand: ObjectId("..."), b: [{ name: "Fender", country: "USA" }] } (där "b" är variabeln ni sätter som "as" i er $lookup)
			},
			{
				// Steg 2: $unwind - Gör om array av brands till objekt
				// Konverterar: { b: [{ name: "Fender" }] }
				// Till: { b: { name: "Fender" } } så att vi kan jobba med själva objektet
			},
			{
				// Steg 3: $project - Hämta ut specifika värden från brand-objektet och räkna ut värdet ($multiply)
				/* $multiply: [
							{ $toDouble: "$price" },
							"$amountInStock", 
						],
                */
				// Sen borde varje dokument ha typ följande: { brand: "Fender", value: 2500 }
			},
			{
				// Steg 4: $group - använd group med _id: "brand_variabel" och sumera värdet vi fick i förra steget med $sum till en ny variabel som heter total
				// Förväntat resultat ex.: [{ _id: "Fender", total: 15000 }, { _id: "Gibson", total: 12000 }]
			},
			{
				// Steg 5: $project - Plocka ut de värden som är relevanta för svaret (vi skulle också kunna använda $unset för att ta bort värden men project är enklare om vi har fler variabler)
				// Troligt resultat: [ { brand: "Gibson", total: 12000 }, { brand: "Fender", total: 15000 }]
			},
			{
				// Steg 6: $sort - Sortera det totala värde (högst först) (descending vilket är -1) (valfritt)
				//Förväntad output: [{ brand: "Fender", total: 15000 }, { brand: "Gibson", total: 12000 }]
			},
		]);

		res.json(out);
	} catch (error) {}
});

/**
 * GET /instruments/low-stock  (amountInStock < 10)
 * Populate eller aggregation?
 * Vad vill vi göra? Hitta alla instrument där amountInStock < 10 och sen hämta brands+reps
 */
app.get("/instruments/low-stock", async (_req, res) => {
	try {
	} catch (error) {}
});

/**
 * GET /instruments/critical-stock (amountInStock < 5) – kompakt lista
 * – Returnera: [{ instrumentName, brand, repName, phone, email }]
 */
app.get("/instruments/critical-stock", async (_req, res) => {
	try {
		const out = await Instrument.aggregate([
			{
				/** Steg 1: $match – filtrera kritiskt lågt lager */
				/*
				 * Förväntat resultat ungefär:
				 * [
				 *   { _id: "...", name: "Stratocaster", brand: ObjectId("b1"), amountInStock: 2, ... },
				 *   { _id: "...", name: "TR-808",      brand: ObjectId("b2"), amountInStock: 1, ... },
				 *   ...
				 * ]
				 */
			},
			{
				/** Steg 2: $lookup – hämta brand-objektet (join mot brands) */
				/*
				 * Efter $lookup (brand blir en array):
				 * [
				 *   { name: "Stratocaster", amountInStock: 2, brand: [{ _id: "b1", name: "Fender", rep: ObjectId("r1"), ... }] },
				 *   { name: "TR-808",      amountInStock: 1, brand: [{ _id: "b2", name: "Roland", rep: ObjectId("r2"), ... }] },
				 *   ...
				 * ]
				 */
			},
			{
				/** Steg 3: $unwind – gör brand till ett objekt istället för array */
				/*
				 * Efter $unwind:
				 * [
				 *   { name: "Stratocaster", amountInStock: 2, brand: { _id: "b1", name: "Fender", rep: ObjectId("r1"), ... } },
				 *   { name: "TR-808",      amountInStock: 1, brand: { _id: "b2", name: "Roland", rep: ObjectId("r2"), ... } },
				 * ]
				 */
			},
			{
				/** Steg 4: $lookup – hämta rep via brand.rep (join mot reps) */
				/*
				 * Efter $lookup av rep (rep blir array):
				 * [
				 *   { name: "Stratocaster", brand: { name: "Fender", rep: "r1" }, rep: [{ _id: "r1", name: "Alice", phone: "070-...", email: "alice@..." }] },
				 *   { name: "TR-808",      brand: { name: "Roland", rep: "r2" }, rep: [{ _id: "r2", name: "Kenji", phone: "+81...", email: "kenji@..." }] },
				 * ]
				 */
			},
			{
				/** Steg 5: $unwind – gör rep till ett objekt */
				/*
				 * Efter $unwind (om rep saknas blir rep: null):
				 * [
				 *   { name: "Stratocaster", brand: { name: "Fender" }, rep: { name: "Alice", phone: "070-...", email: "alice@..." } },
				 *   { name: "TR-808",      brand: { name: "Roland" }, rep: { name: "Kenji", phone: "+81...", email: "kenji@..." } },
				 * ]
				 */
			},
			{
				/** Steg 6: $project – forma det kompakta svaret och döp om fält */
				/*
				 * Förväntat resultat ungefär:
				 * [
				 *   { instrumentName: "Stratocaster", brand: "Fender", repName: "Alice Andersson", phone: "070-1234567", email: "alice@fender.com" },
				 *   { instrumentName: "TR-808",      brand: "Roland", repName: "Kenji Tanaka",     phone: "+81 123 456 789", email: "kenji@roland.com" }
				 * ]
				 */
			},
			{
				/** (Valfritt) Steg 7: $sort – t.ex. visa minst först, sedan alfabetiskt */
				/*
				 * Sorterad lista i samma struktur som ovan.
				 */
			},
		]);

		res.json(out);
	} catch (error) {
		console.error("[/instruments/critical-stock] error:", error);
		res.status(500).json({ error: "Failed to build critical stock list" });
	}
});

/**
 * GET /instruments/critical-stock-populate
 * – Populate-version av critical list (amountInStock < 5)
 * – Returnera: [{ instrumentName, brand, repName, phone, email }]
 */
app.get("/instruments/critical-stock-populate", async (_req, res) => {
	try {
	} catch (error) {}
});

/**
 * GET /brands – alla brands med rep, använd populate
 */
app.get("/brands", async (_req, res) => {
	try {
	} catch (error) {}
});

// -----------------

app.post("/instruments", async (req, res) => {
	try {
		const created = await Instrument.create(req.body);
		res.status(201).json(created);
	} catch (error) {
		res
			.status(400)
			.json({ error: "Invalid instrument payload", details: error.message });
	}
});

const PORT = 3000;

connectDB()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`REST API is running on port ${PORT}`);
		});
	})
	.catch(console.error);
