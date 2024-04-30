import { Server } from "azle";
import express from "express";

export default Server(() => {
  const app = express();

  // main function, to read from other canister
  // parse it and return with the png transformation
  app.get("/", (req, res) => {
    if (!req.query.hero_id) res.send(`Query parameter "hero_id" is required.`);

    res.send(`<h1>${req.query.hero_id}</h1>`);
  });

  return app.listen();
});
