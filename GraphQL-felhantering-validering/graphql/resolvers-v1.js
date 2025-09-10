// resolvers.v1.js (demo 1)
import { Instrument, Brand, Rep } from "../models/models.js";

export const resolversV1 = {
	Query: {
		instruments: async (_p, { limit }) => {
			const instruments = await Instrument.find();
			return instruments;
		},
		instrument: async (_p, { id }) => {
			return Instrument.findById(id);
		},
	},

	Mutation: {
		updateInstrumentStock: async (_p, { input }) => {
			const { id, delta } = input;
			const instrument = await Instrument.findById(id);
			instrument.amountInStock += delta;
			await instrument.save();
			return instrument;
		},
	},

	Instrument: {
		id: (doc) => String(doc._id),
		brand: async (doc) => await Brand.findById(doc.brand),
		price: (doc) => (doc.price ? parseFloat(doc.price.toString()) : null),
		createdAt: (doc) => doc.createdAt.toISOString(),
		updatedAt: (doc) => doc.updatedAt.toISOString(),
	},
};
