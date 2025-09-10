// resolvers.v1.js (demo 1)
import mongoose from "mongoose";
import { Instrument, Brand, Rep } from "../models/models.js";
import { GraphQLError } from "graphql";

export const resolversV2 = {
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

			if (!mongoose.isValidObjectId(id)) {
				throw new GraphQLError("ID is not valid", {
					extensions: { code: "NOT_VALID_ID", instrumentId: id },
				});
			}

			const instrument = await Instrument.findById(id);

			if (!instrument) {
				throw new GraphQLError("Instrument not found", {
					extensions: { code: "STATUS_CODE_404", instrumentId: id },
				});
			}

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
