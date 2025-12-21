import { Router } from "express";
import {
  shortenUrl,
  visitUrl,
  getStats,
  getUrls,
  getNumberOfAllUrls,
  deleteUrl,
} from "../controllers/url.controller.js";
import { isAllowed } from "../middlewares/isAllowed.middleware.js";
import { error } from "console";
export const urlRouter = Router();

urlRouter.post("/shorten", shortenUrl);
urlRouter.get("/my-urls", isAllowed, getUrls);
urlRouter.get("/get-number-of-all-urls", getNumberOfAllUrls);
urlRouter.get("/:slug", visitUrl);
urlRouter.get("/stats/:slug", isAllowed, getStats);
urlRouter.delete("/delete/:slug", isAllowed, deleteUrl);
