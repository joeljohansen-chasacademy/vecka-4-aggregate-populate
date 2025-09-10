/**
 * MongoDB Aggregation Pipeline Cheat Sheet
 *
 * Detta är en översikt över de vanligaste aggregation stages,
 * vad de gör, vilken input de tar och när man använder dem.
 * Här finns länk till dokumentationen: https://www.mongodb.com/docs/manual/reference/mql/aggregation-stages/
 */

// --------------------------------------
// $match
// --------------------------------------
/**
 * Filtrerar dokument (som find()).
 * Input: ett filterobjekt.
 * Användning: Begränsa mängden data tidigt i pipelinen.
 */
{ $match: { kind: "guitar", amountInStock: { $gt: 0 } } }

// --------------------------------------
// $project
// --------------------------------------
/**
 * Väljer vilka fält som ska returneras och kan skapa nya fält.
 * Input: ett objekt med fältnamn:
 *   1 = behåll fältet
 *   0 = ta bort fältet
 *   uttryck = skapa nytt fält
 */
{
  $project: {
    name: 1,
    totalValue: { $multiply: ["$price", "$amountInStock"] }
  }
}

// --------------------------------------
// $sort
// --------------------------------------
/**
 * Sorterar dokument.
 * Input: fält + riktning (1 = stigande, -1 = fallande).
 */
{ $sort: { createdAt: -1 } }

// --------------------------------------
// $skip och $limit
// --------------------------------------
/**
 * Hoppa över X dokument och begränsa antalet.
 * Användning: Paginering.
 */
{ $skip: 20 }
{ $limit: 10 }

// --------------------------------------
// $lookup
// --------------------------------------
/**
 * Join mellan två collectioner (som SQL LEFT JOIN).
 * Input:
 *   from: vilken collection
 *   localField: fält i nuvarande dokument
 *   foreignField: fält i andra collectionen
 *   as: namn på arrayfältet som resultatet sparas i
 */
{
  $lookup: {
    from: "brands",
    localField: "brand",
    foreignField: "_id",
    as: "brand"
  }
}

// --------------------------------------
// $unwind
// --------------------------------------
/**
 * Tar en array och gör flera dokument, ett per element.
 * Användning: När man vill jobba med varje element separat.
 */
{ $unwind: "$items" }

// --------------------------------------
// $set (alias $addFields)
// --------------------------------------
/**
 * Skapar eller uppdaterar fält.
 */
{ $set: { totalValue: { $multiply: ["$price", "$amountInStock"] } } }

// --------------------------------------
// $unset
// --------------------------------------
/**
 * Tar bort fält.
 */
{ $unset: "password" }

// --------------------------------------
// $group
// --------------------------------------
/**
 * Grupperar dokument (som SQL GROUP BY).
 * Input:
 *   _id = fältet att gruppera på
 *   operatorer = $sum, $avg, $max, $min, $push etc.
 */
{
  $group: {
    _id: "$kind",
    totalStock: { $sum: "$amountInStock" },
    avgPrice: { $avg: "$price" }
  }
}

// --------------------------------------
// Vanliga operatorer
// --------------------------------------
/**
 * $sum: summerar värden (eller räknar dokument om man skriver $sum: 1)
 * $avg: medelvärde
 * $max: största värdet
 * $min: minsta värdet
 * $multiply: multiplikation, t.ex. $multiply: ["$price", "$amountInStock"]
 * $add: addition, t.ex. $add: ["$prepTimeMin", "$cookTimeMin"]
 * $toDouble: konverterar Decimal128 till Number
 * $ifNull: hantera null, t.ex. $ifNull: ["$brand", "Unknown"]
 * $first: första elementet i en array
 * 
 * Länk till dokumentationen: https://www.mongodb.com/docs/manual/reference/mql/expressions/
 * Länk till dokumentationen: https://www.mongodb.com/docs/manual/reference/mql/accumulators/
 * 
 */

// --------------------------------------
// Tips
// --------------------------------------
/**
 * - Lägg $match tidigt för bättre prestanda.
 * - $lookup ger alltid en array – ofta kombineras det med $unwind eller $set/$first.
 * - $group "resettar" dokumentet: du får bara det du explicit skapar i $group.
 * - Testa pipeline steg för steg i MongoDB Compass eller mongosh.
 */

// --------------------------------------
// Demo-pipelines
// --------------------------------------

/**
 * Exempel: Hämta alla gitarrer, sortera på pris,
 * beräkna totalValue (pris * antal i lager),
 * och ta fram de 5 dyraste.
 */

const pipeline = [
  { $match: { kind: "guitar" } }, // filtrera fram gitarrer
  {
    $set: {
      totalValue: { $multiply: ["$price", "$amountInStock"] }
    }
  }, // beräkna totalValue
  { $sort: { price: -1 } }, // sortera på pris, dyrast först
  { $limit: 5 }, // ta fram topp 5
  {
    $project: {
      name: 1,
      price: 1,
      amountInStock: 1,
      totalValue: 1
    }
  } // returnera endast dessa fält
];

// Sen kan du köra:
// const result = await Instrument.aggregate(pipeline);

const pipeline = [
  { $match: { kind: "guitar" } }, // filtrera fram gitarrer
  {
    $lookup: {
      from: "brands",
      localField: "brand",
      foreignField: "_id",
      as: "brand"
    }
  }, // join mot brands
  { $unwind: "$brand" }, // ta ut brand-objektet ur arrayen
  {
    $set: {
      totalValue: { $multiply: ["$price", "$amountInStock"] }
    }
  }, // beräkna totalValue
  { $sort: { price: -1 } }, // sortera på pris
  { $limit: 5 }, // topp 5
  {
    $project: {
      name: 1,
      price: 1,
      amountInStock: 1,
      totalValue: 1,
      "brand.name": 1
    }
  } // returnera bara de fält vi vill se
];

// const result = await Instrument.aggregate(pipeline);
