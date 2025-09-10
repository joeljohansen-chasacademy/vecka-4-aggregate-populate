import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { Rep, Brand, Instrument } from "../models/models.js";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;

// helpers
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const kinds = ["guitar", "bass", "synth", "drums", "mic", "other"];

function dec(n) {
	return mongoose.Types.Decimal128.fromString(n.toFixed(2));
}

async function main() {
	await mongoose.connect(MONGODB_URI, {
        dbName: "music_store",
    });
	console.log("Connected:", MONGODB_URI);

	// Rensa (valfritt i demo)
	await Promise.all([
		Instrument.deleteMany({}),
		Brand.deleteMany({}),
		Rep.deleteMany({}),
	]);

	// 1) Skapa representanter först (eftersom brand har rep)
	const reps = Array.from({ length: 12 }).map(() => ({
		name: faker.person.fullName(),
		email: faker.internet.email().toLowerCase(),
		phone: faker.phone.number(),
	}));
	const repDocs = await Rep.insertMany(reps, { ordered: false });

	// 2) Skapa brands (varumärken) där varje brand har en representant som vi slumpar ut när vi lägger till varumärket i vår collection.
    //Lägg marke till att vi inte lägger till hela repet som embedded content utan skapar en referens till rep med rand(repDocs)._id.
	const brands = Array.from({ length: 10 }).map(() => {
		const name = faker.company.name().replace(/,? Inc\.?$/i, "");
		return {
			name,
			country: faker.location.country(),
			website: faker.internet.url(),
			description: faker.company.catchPhrase(),
			address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
			rep: rand(repDocs)._id,
		};
	});
	const brandDocs = await Brand.insertMany(brands, { ordered: false });

	// 3) Skapa instruments (instrument) där varje instrument har ett varumärke som vi slumpar ut när vi lägger till instrumentet i vår collection.
    // Nu har alltså vår collection brand, rep och instrument.
	// Skapa varierade namn/sku och “rimliga” priser per kategori
	const priceRange = {
		guitar: [99, 3999],
		bass: [149, 2999],
		synth: [199, 6999],
		drums: [49, 4999],
		mic: [49, 1299],
		other: [19, 1999],
	};

	const instruments = Array.from({ length: 1000 }).map(() => {
		const kind = rand(kinds);
		const [min, max] = priceRange[kind];
		const price = Number(faker.number.float({ min, max, fractionDigits: 2 }));
		const brand = rand(brandDocs);
		const baseName = faker.commerce.productName(); // “Telecaster Pro”, “Studio XYZ” etc
		const sku = `${brand.name.slice(0, 3).toUpperCase()}-${kind
			.slice(0, 3)
			.toUpperCase()}-${faker.string
			.alphanumeric({ length: 5 })
			.toUpperCase()}`;
		return {
			name: baseName,
			sku,
			kind,
			description: faker.commerce.productDescription(),
			price: dec(price),
			brand: brand._id,
			amountInStock: faker.number.int({ min: 0, max: 50 }),
		};
	});

	// snabb bulk
	await Instrument.insertMany(instruments, { ordered: false });

	const total = await Instrument.countDocuments();
	console.log(
		`Seed klar. Instruments: ${total}, Brands: ${brandDocs.length}, Reps: ${repDocs.length}`
	);
	await mongoose.disconnect();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
