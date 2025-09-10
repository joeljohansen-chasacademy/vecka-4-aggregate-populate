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
		const instruments = await Instrument.find();
		res.json(instruments);
	} catch (error) {
		console.error("[/instruments] error:", error); // <- viktig
		res.status(500).json({ error: "Failed to fetch instruments" });
	}
});

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
