import { Instrument, Brand } from "../models/models.js";
import { GraphQLError } from "graphql";

export const resolversV2 = {
	Query: {
		instruments: async (_p, { limit }) => {},
		instrument: async (_p, { id }) => {},
	},

	Mutation: {
		updateInstrumentStock: async (_p, { input }) => {},
	},

	Instrument: {
		id: (doc) => String(doc._id),
		brand: async (doc) => {},
		price: (doc) => (doc.price ? parseFloat(doc.price.toString()) : null),
		createdAt: (doc) => doc.createdAt.toISOString(),
		updatedAt: (doc) => doc.updatedAt.toISOString(),
	},
};
