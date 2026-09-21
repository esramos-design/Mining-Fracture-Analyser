import fs from "node:fs";

const datasetPath = new URL("../data/star-citizen-4.10.1.json", import.meta.url);
const manifestPath = new URL("../data/data-integrity-manifest.json", import.meta.url);

const data = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const errors = [];

for (const metaField of ["schemaVersion","targetGame","targetPatch","launcherBuild","sources"]) {
  if (!(metaField in data)) errors.push(`dataset missing metadata field: ${metaField}`);
}

for (const [category, rules] of Object.entries(manifest.categories)) {
  const rows = data[category];

  if (!Array.isArray(rows)) {
    errors.push(`${category}: missing table/array`);
    continue;
  }

  const names = rows.map(row => row?.name);
  const duplicates = names.filter((name, index) => name && names.indexOf(name) !== index);
  if (duplicates.length) {
    errors.push(`${category}: duplicate items: ${[...new Set(duplicates)].join(", ")}`);
  }

  const missingItems = rules.expectedItems.filter(name => !names.includes(name));
  if (missingItems.length) {
    errors.push(`${category}: expected items removed: ${missingItems.join(", ")}`);
  }

  for (const row of rows) {
    const label = row?.name || "<unnamed>";

    for (const field of rules.requiredFields) {
      if (!Object.prototype.hasOwnProperty.call(row, field)) {
        errors.push(`${category}/${label}: required attribute removed: ${field}`);
      }
    }
  }

  const presentFieldUnion = new Set(rows.flatMap(row => Object.keys(row || {})));
  for (const field of rules.requiredFields) {
    if (!presentFieldUnion.has(field)) {
      errors.push(`${category}: required column absent from table: ${field}`);
    }
  }

  console.log(
    `${category}: ${rows.length} rows, ${presentFieldUnion.size} attributes, ${rules.expectedItems.length} protected identities`
  );
}

if (errors.length) {
  console.error("\nDATA INTEGRITY FAILURE");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}

console.log("\nMFA data integrity contract: PASS");
