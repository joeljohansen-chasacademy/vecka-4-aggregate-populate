import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/typedefs.js";
//import { resolvers as resolversV1 } from "./graphql/resolvers_v1.js"; // naive (N+1)
//import { resolvers as resolversV2 } from "./graphql/resolvers_v2.js"; // populate
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
		// GraphQL endpoint with Apollo Server
		// Use V1 by default. Swap to V2 or V3 by changing this import above.
		const server = new ApolloServer({ typeDefs, resolvers: resolversV3 });
		await server.start();
		// V1/V2 middleware (no DataLoader context):
		//app.use("/graphql", expressMiddleware(server));

		// V3 middleware (with DataLoader) – uncomment when using resolversV3
		app.use(
			"/graphql",
			expressMiddleware(server, {
				context: async () => ({ ...createLoaders() }),
			})
		);

		app.listen(PORT, () => {
			console.log(`REST API is running on port ${PORT}`);
			console.log(
				`GraphQL endpoint available at http://localhost:${PORT}/graphql`
			);
		});
	})
	.catch(console.error);
