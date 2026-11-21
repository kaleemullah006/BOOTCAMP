const sharp = require("sharp");

const size = 512;
const mask = Buffer.from(
  `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`
);

sharp("public/logo.png")
  .resize(size, size, { fit: "cover" })
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toFile("public/logo-circle.png")
  .then(() => console.log("Done: public/logo-circle.png"))
  .catch(console.error);