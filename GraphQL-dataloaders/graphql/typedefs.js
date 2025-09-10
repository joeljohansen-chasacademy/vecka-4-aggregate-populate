export const typeDefs = /* GraphQL */ `
	type Brand {
		id: ID!
		name: String!
	}

	type Instrument {
		id: ID!
		name: String!
		price: Float
		brand: Brand
	}

	type Query {
		# One field; switch resolver files in index.js to demo v1/v2/v3
		instruments: [Instrument!]!
	}
`;
