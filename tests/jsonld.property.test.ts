// Run with: npx tsx --env-file=.env.local --test tests/jsonld.property.test.ts
//
// Focused tests for the property LodgingBusiness schema builder: every fact
// must come from a real CMS field, unknown optional values must be omitted
// (never defaulted to 0/false), nothing not yet verifiable (ratings, pet
// policy) is emitted today, and accommodation-level facts (bedrooms,
// occupancy) are correctly nested on the Accommodation being booked rather
// than asserted directly on the LodgingBusiness that operates it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLodgingBusinessSchema, normalizeLandlordSlug } from "../src/sanity/jsonld";

const BASE_PROPERTY = {
  name: "Test Cottage",
  slug: "test-cottage",
};

test("omits address entirely when no location fields are set", () => {
  const schema = buildLodgingBusinessSchema(BASE_PROPERTY);
  assert.equal("address" in schema, false);
});

test("builds address from city/region/country, omitting unset postal/street fields", () => {
  const schema = buildLodgingBusinessSchema({
    ...BASE_PROPERTY,
    city: "Ardee",
    region: "Louth",
    country: "IE",
  });
  assert.deepEqual(schema.address, {
    "@type": "PostalAddress",
    addressLocality: "Ardee",
    addressRegion: "Louth",
    addressCountry: "IE",
  });
  assert.equal("streetAddress" in (schema.address as object), false);
  assert.equal("postalCode" in (schema.address as object), false);
});

test("falls back to the free-text location field when city/region are unset", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, location: "Ardee, Co. Louth" });
  assert.deepEqual(schema.address, {
    "@type": "PostalAddress",
    addressLocality: "Ardee, Co. Louth",
  });
});

test("omits geo when the geopoint is null", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, geo: null });
  assert.equal("geo" in schema, false);
});

test("omits geo when the stored coordinates are out of valid range (bad data entry)", () => {
  // Mirrors a real data bug found in Sanity: a longitude typed without its
  // sign/decimal point, producing a huge out-of-range number.
  const schema = buildLodgingBusinessSchema({
    ...BASE_PROPERTY,
    geo: { lat: 55.19489111630378, lng: 7836997776020963 },
  });
  assert.equal("geo" in schema, false);
});

test("includes geo only when both coordinates are finite and in range", () => {
  const schema = buildLodgingBusinessSchema({
    ...BASE_PROPERTY,
    geo: { lat: 52.9416853, lng: -9.426696 },
  });
  assert.deepEqual(schema.geo, {
    "@type": "GeoCoordinates",
    latitude: 52.9416853,
    longitude: -9.426696,
  });
});

// ---- LodgingBusiness vs. the Accommodation it contains ----
// schema.org defines numberOfBedrooms/occupancy on Accommodation, not on
// LodgingBusiness — these facts belong on a nested `containsPlace`, not
// the business entity itself, except for a guest house's own room count.

test("entire-house property: nests bedrooms/occupancy under containsPlace, not on the business", () => {
  const schema = buildLodgingBusinessSchema({
    ...BASE_PROPERTY,
    propertyType: "Entire House",
    bedrooms: 4,
    sleeps: 8,
  });
  assert.equal("numberOfRooms" in schema, false);
  assert.deepEqual(schema.containsPlace, {
    "@type": "House",
    occupancy: { "@type": "QuantitativeValue", maxValue: 8 },
    numberOfBedrooms: 4,
  });
});

test("apartment property: containsPlace uses the Apartment subtype", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, propertyType: "Apartment", bedrooms: 2 });
  assert.equal((schema.containsPlace as { "@type": string })["@type"], "Apartment");
});

test("unrecognized propertyType falls back to the generic Accommodation subtype, never asserts a style", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, propertyType: "Yurt", bedrooms: 1 });
  assert.equal((schema.containsPlace as { "@type": string })["@type"], "Accommodation");
});

test("omits numberOfBedrooms on containsPlace when bedrooms is null, never defaults to 0", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, propertyType: "Entire House", sleeps: 8, bedrooms: null });
  assert.equal("numberOfBedrooms" in (schema.containsPlace as object), false);
});

test("omits containsPlace entirely when there's no occupancy or bedroom fact to nest", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, propertyType: "Entire House" });
  assert.equal("containsPlace" in schema, false);
});

test("guest-house 'Room' property: bedrooms reads as the business's own numberOfRooms, no containsPlace invented", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, propertyType: "Room", bedrooms: 3, sleeps: 10 });
  assert.equal(schema.numberOfRooms, 3);
  assert.equal("containsPlace" in schema, false);
});

test("'Room' property omits numberOfRooms when bedrooms is null, never defaults to 0", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, propertyType: "Room", bedrooms: null });
  assert.equal("numberOfRooms" in schema, false);
});

test("passes priceLabel through unchanged as priceRange, without reformatting", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, priceLabel: "420" });
  assert.equal(schema.priceRange, "420");
});

test("omits priceRange when priceLabel is not set", () => {
  const schema = buildLodgingBusinessSchema({ ...BASE_PROPERTY, priceLabel: null });
  assert.equal("priceRange" in schema, false);
});

test("only includes amenityFeature entries that are actually in the CMS amenities array", () => {
  const schema = buildLodgingBusinessSchema({
    ...BASE_PROPERTY,
    amenities: ["WiFi", "Sea views"],
  });
  assert.deepEqual(schema.amenityFeature, [
    { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Sea views", value: true },
  ]);
  // No invented amenity (e.g. "Pet-friendly") that isn't in the input array.
  const names = (schema.amenityFeature as { name: string }[]).map((a) => a.name);
  assert.equal(names.includes("Pet-friendly"), false);
});

test("omits aggregateRating, petsAllowed, checkinTime and checkoutTime today — no verified CMS source exists yet for any of them", () => {
  // This documents today's input-driven behavior, not a permanent rule: the
  // builder's PropertyForSchema type simply has no field for these yet. If
  // a verified source is added later (e.g. a real review-platform score, a
  // confirmed pet policy, or real check-in/out times), the type and this
  // test should both be updated to emit it — omission here is a statement
  // about current data, not a ban on ever supporting these facts.
  const schema = buildLodgingBusinessSchema(BASE_PROPERTY);
  assert.equal("aggregateRating" in schema, false);
  assert.equal("petsAllowed" in schema, false);
  assert.equal("checkinTime" in schema, false);
  assert.equal("checkoutTime" in schema, false);
});

test("parentOrganization always reads 'SOS Stays' as name, 'Power Rangers Ltd' as legalName", () => {
  const schema = buildLodgingBusinessSchema(BASE_PROPERTY, { businessName: "Power Rangers Ltd" });
  assert.equal((schema.parentOrganization as { name: string }).name, "SOS Stays");
  assert.equal((schema.parentOrganization as { legalName: string }).legalName, "Power Rangers Ltd");
});

test("acceptsReservations is always true — a verified platform-level fact, not per-property guesswork", () => {
  const schema = buildLodgingBusinessSchema(BASE_PROPERTY);
  assert.equal(schema.acceptsReservations, true);
});

// ---- Sitemap landlord-slug normalization (same helper used for the fix) ----

test("normalizeLandlordSlug: hub slug '/landlords' normalizes to empty (the hub itself)", () => {
  assert.equal(normalizeLandlordSlug("/landlords"), "");
});

test("normalizeLandlordSlug: '/landlords/pricing' normalizes to 'pricing'", () => {
  assert.equal(normalizeLandlordSlug("/landlords/pricing"), "pricing");
});

test("normalizeLandlordSlug: a bare sub-slug passes through unchanged", () => {
  assert.equal(normalizeLandlordSlug("pricing"), "pricing");
});

test("normalizeLandlordSlug: empty/undefined input normalizes to empty string", () => {
  assert.equal(normalizeLandlordSlug(undefined), "");
  assert.equal(normalizeLandlordSlug(""), "");
});
