// resolvers.v1.js (demo 1)
import mongoose from "mongoose";
import { Instrument, Brand, Rep } from "../models/models.js";
import { GraphQLError } from "graphql";
import { z } from "zod";

const ERR = {
	NOT_FOUND: "NOT_FOUND",
	BAD_USER_INPUT: "BAD_USER_INPUT",
	INTERNAL: "INTERNAL_SERVER_ERROR",
};

//http://zod.dev

const UpdateStockSchema = z.object({
	id: z.string(),
	delta: z.coerce
		.number()
		.int("Value must be an integer")
		.min(-10, "Value can't be less than -10")
		.max(10, "Value can't be more than 10"),
});

export const resolversV3 = {
	Query: {
		instruments: async (_p, { limit }) => {
			try {
				const instruments = await Instrument.find();
				return instruments;
			} catch (error) {
				throw new GraphQLError("Invalid input", {
					extensions: {
						code: ERR.INTERNAL,
						error: error,
					},
				});
			}
		},
		instrument: async (_p, { id }) => {
			return Instrument.findById(id);
		},
	},

	Mutation: {
		updateInstrumentStock: async (_p, { input }) => {
			const result = UpdateStockSchema.safeParse(input);
			console.log(result);
			if (!result.success) {
				throw new GraphQLError("Invalid input", {
					extensions: { code: ERR.BAD_USER_INPUT, issues: result.error.issues },
				});
			}

			const { id, delta } = input;

			if (!mongoose.isValidObjectId(id)) {
				throw new GraphQLError("ID is not valid", {
					extensions: { code: ERR.BAD_USER_INPUT, instrumentId: id },
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
