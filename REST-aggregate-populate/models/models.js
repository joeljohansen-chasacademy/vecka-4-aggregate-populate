import mongoose from "mongoose";

const InstrumentSchema = new mongoose.Schema(
	{
		name: { type: String, required: true }, // “Telecaster”
		sku: { type: String, required: true, unique: true, index: true },
		kind: {
			type: String,
			enum: ["guitar", "bass", "synth", "drums", "mic", "other"],
			index: true,
		},
		description: String,
		price: { type: mongoose.Decimal128, required: true, min: 0 },
		brand: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Brand", //Ref är alltså en referens till det vi döper vår modell till nedan. I detta fall är det "Brand". Spelar ingen roll vad vår collection heter.
			required: true,
		},
		amountInStock: { type: Number, required: true, min: 0 },
	},
	{ timestamps: true, collection: "instruments" }
);
export const Instrument = mongoose.model("Instrument", InstrumentSchema);

const RepSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, lowercase: true, required: true },
		phone: String,
	},
	{ timestamps: true }
);
export const Rep = mongoose.model("Rep", RepSchema);

const BrandSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true },
		country: String,
		website: String,
		description: String,
		address: String,
		rep: { type: mongoose.Schema.Types.ObjectId, ref: "Rep" }, //samma sak här. Spelar ingen roll vad vår collection heter.
	},
	{ timestamps: true }
);
export const Brand = mongoose.model("Brand", BrandSchema);
