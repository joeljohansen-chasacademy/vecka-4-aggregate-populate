import { Instrument, Brand } from "../models/models.js";

export const resolvers = {
	Query: {
		async instruments() {
			const docs = await Instrument.find().lean();
			return docs.map((d) => ({ d, _noDataloader: true }));
		},
	},

	Instrument: {
		id: (doc) => String(doc._id),
		brand: async (doc) => await Brand.findById(doc.brand),
	},

	Brand: {
		id: (doc) => String(doc._id),
	},
};
