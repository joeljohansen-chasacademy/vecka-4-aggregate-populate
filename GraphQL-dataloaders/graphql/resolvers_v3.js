import { Instrument, Brand } from "../models/models.js";
import DataLoader from "dataloader";

export const resolvers = {
	Query: {
		async instruments() {
			const docs = await Instrument.find().lean();
			return docs;
		},
	},

	Instrument: {
		id: (doc) => String(doc._id),
		brand: (doc, args, context) => {
			/*
            Vad jag hade skrivit tidigare:
            return context.brandLoader.load(doc.brand.id);
            Detta funkade inte eftersom vi här inte hämtat brand..
            doc.brand i vår instruments-collection är ju brandets objectId.
            Det är det vi vill skicka till vår brandLoader.
            Det kan också vara bra att konvertera våra ids till strings eftersom våra brands är objectIds.
            Funkar utan konvertering men för säkerhets skull..
            */
			return context.brandLoader.load(String(doc.brand));
		},
	},

	Brand: {
		id: (doc) => String(doc._id),
	},
};

export function createLoaders() {
	return {
		brandLoader: new DataLoader(async (ids) => {
			/*
            Mitt exempel under lektionen var lite väl förenklat.


            Vad jag hade skrivit tidigare:
            const brands = await Brand.find({ _id: { ids } })
            Vi behöver istället använda $in operatorn. 
            Som kollar om brandets objectId finns i vår batch av ids.
            Alltså så: const brands = await Brand.find({ _id: { $in: ids } }).lean();
            Se dokumentationen om $in här: // https://www.mongodb.com/docs/manual/reference/operator/query/in/

            I min return försökte jag också returnera brands efter att jag hade skrivit
            const brands = await Brand.find({ _id: { $in: ids } }).lean();
            return brands;
            Det här funkar inte eftersom:
            DataLoader kräver att returarrayen har samma längd som `ids`, är i samma ordning som `ids` samt innehåller null där en träff saknas
          Om man returnerar `brands` direkt från en $in-query är ordningen godtycklig, vi kan få dubletter i ids och saknade id:n blir helt enkelt frånvarande (inte null)
          
          Läs mer om detta i dokumentationen för DataLoader här: https://github.com/graphql/dataloader?tab=readme-ov-file#batch-function

          Vi behöver också konvertera våra ids till strings eftersom våra brands är objectIds.
          Därav String(b._id) och String(id).

            */

			//Hitta alla brands som finns i vår batch av ids.
			const brands = await Brand.find({ _id: { $in: ids } }).lean();
			//Skapa en map som kopplar samman våra ids med våra brands.
			const brandById = new Map(brands.map((b) => [String(b._id), b]));
			//Då får vi en map som vi kan hämta våra brands från. med .get(id).
			return ids.map((id) => brandById.get(String(id)) ?? null);
		}),
	};
}
