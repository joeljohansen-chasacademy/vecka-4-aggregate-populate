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

		/*
        * ALTERNATIVE PIPELINE ( utan $project steget)
        await Instrument.aggregate([
              { $lookup: { from: "brands", localField: "brand", foreignField: "_id", as: "b" } },
              { $unwind: "$b" },
              {
                $group: {
                  _id: "$b.name",
                  total: {
                    $sum: {
                      $multiply: [ { $toDouble: "$price" }, "$amountInStock" ]
                    }
                  }
                }
              },
              { $project: { _id: 0, brand: "$_id", total: 1 } },
              { $sort: { total: -1 } }
            ]);
        */
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
 * – använd aggregation för att skapa en critical list (amountInStock < 5)
 * – Returnera: [{ instrumentName, brand, repName, phone, email }]
 */
app.get("/instruments/critical-stock", async (_req, res) => {
	try {
	} catch (error) {}
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
