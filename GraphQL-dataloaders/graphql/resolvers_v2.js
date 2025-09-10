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
		/*
        Här hade vi också kunnat skriva och hämta branden med await Brand.findById(doc.brand),
        om det inte populerats tidigare.
        brand: (doc) => doc.brand ?? await Brand.findById(doc.brand),
        */
	},

	Brand: {
		id: (doc) => String(doc._id),
	},
};
