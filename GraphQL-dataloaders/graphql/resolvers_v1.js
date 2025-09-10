import { Instrument, Brand } from "../models/models.js";

export const resolvers = {
	Query: {
		async instruments() {
			const docs = await Instrument.find();
			return docs;
		},
	},

	Instrument: {
		id: (doc) => (doc.id ?? doc._id)?.toString(),
		brand: async (doc) => await Brand.findById(doc.brand),
	},

	Brand: {
		id: (doc) => (doc.id ?? doc._id)?.toString(),
	},
};
