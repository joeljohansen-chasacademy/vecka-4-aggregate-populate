import { Instrument, Brand } from "../models/models.js";

export const resolvers = {
	Query: {
		async instruments() {
			const docs = await Instrument.find().populate("brand");
			return docs;
		},
	},

	Instrument: {
		id: (doc) => String(doc._id),
		brand: (doc) => doc.brand ?? null,
	},

	Brand: {
		id: (doc) => String(doc._id),
	},
};
