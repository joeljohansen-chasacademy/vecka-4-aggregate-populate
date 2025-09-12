import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./graphql/typedefs.js";
import { resolvers as resolversV1 } from "./graphql/resolvers_v1.js"; // naive (N+1)
import { resolvers as resolversV2 } from "./graphql/resolvers_v2.js"; // populate
import {
	resolvers as resolversV3,
	createLoaders,
} from "./graphql/resolvers_v3.js"; // dataloader

dotenv.config();

const app = express();

app.use(express.json());

const PORT = 3000;

connectDB()
	.then(async () => {
		const server = new ApolloServer({ typeDefs, resolvers: resolversV2 });
		await server.start();
		app.use(
			"/graphql",
			expressMiddleware(server, {
				context: async () => ({}),
			})
		);
		/* app.use(
			"/graphql",
			expressMiddleware(server, {
				context: async () => ({ ...createLoaders() }),
			})
		); */

		app.listen(PORT, () => {
			console.log(`REST API is running on port ${PORT}`);
			console.log(
				`GraphQL endpoint available at http://localhost:${PORT}/graphql`
			);
		});
	})
	.catch(console.error);
