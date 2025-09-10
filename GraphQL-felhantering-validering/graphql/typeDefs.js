export const typeDefs = /* GraphQL */ `
	enum InstrumentKind {
		guitar
		bass
		synth
		drums
		mic
		other
	}
	type Instrument {
		id: ID!
		name: String!
		sku: String!
		kind: InstrumentKind!
		description: String
		price: Float!
		brand: Brand!
		amountInStock: Int!
		createdAt: String!
		updatedAt: String!
	}
	type Rep {
		id: ID!
		name: String!
		email: String!
		phone: String
		createdAt: String!
		updatedAt: String!
	}
	type Brand {
		id: ID!
		name: String!
		country: String
		website: String
		description: String
		address: String
		rep: Rep
		createdAt: String!
		updatedAt: String!
	}

	type Query {
		instruments(limit: Int = 20): [Instrument!]!
		instrument(id: ID!): Instrument
	}

	# CreateInstrumentInput
	# CreateBrandInput
	# CreateRepInput

	input UpdateStockInput {
		id: ID!
		delta: Int! # kan vara negativt -> I detta fall är det ett sätt att uppdatera hur många instrumenter vi har i lager. Så om ett säljs = -1, om ett köps = +1.
	}

	type Mutation {
		updateInstrumentStock(input: UpdateStockInput!): Instrument!
	}
`;
