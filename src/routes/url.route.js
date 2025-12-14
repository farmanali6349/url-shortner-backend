import { Router } from "express";
import { shortenUrl, visitUrl, getStats } from "../controllers/url.controller.js";
export const urlRouter = Router();

urlRouter.post("/shorten", shortenUrl);
urlRouter.get("/:slug", visitUrl);
urlRouter.get("/stats/:slug", getStats);
