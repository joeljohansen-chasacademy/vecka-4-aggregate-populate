// resolvers.v1.js (demo 1)
import { Instrument, Brand, Rep } from "../models/models.js";

export const resolversV1 = {
	Query: {
		instruments: async (_p, { limit }) => {},
		instrument: async (_p, { id }) => {},
	},

	Mutation: {
		updateInstrumentStock: async (_p, { input }) => {},
	},

	Instrument: {
		id: (doc) => String(doc._id),
		brand: async (doc) => await Brand.findById(doc.brand),
		price: (doc) => (doc.price ? parseFloat(doc.price.toString()) : null),
		createdAt: (doc) => doc.createdAt.toISOString(),
		updatedAt: (doc) => doc.updatedAt.toISOString(),
	},
};
