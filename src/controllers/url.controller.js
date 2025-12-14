import { nanoid } from "nanoid";
import { URL } from "../model/url.model.js";
import { detectDeviceInfo } from "../utils/detectDeviceInfo.js";
import { Click } from "../model/click.model.js";

export const shortenUrl = async (req, res) => {
  const data = req.body;

  const url = data?.url;
  try {
    if (!url) {
      throw new Error("URL is missing from request body");
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      code: error?.errorCode,
      message: error?.message,
      details: error?.details,
      data: {},
    });
  }

  const slug = nanoid(7).toLowerCase();

  try {
    const shortenUrl = await URL.create({
      totalClicks: 0,
      originalUrl: url,
      lastVisited: null,
      slug,
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Url shortened successfully.",
      data: { _id: shortenUrl._id, slug: shortenUrl.slug },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      code: error?.errorCode,
      message: error?.message,
      details: error?.details,
      data: {},
    });
  }
};

export const visitUrl = async (req, res) => {
  const slug = req.params?.slug;

  console.log("Slug I received", slug);

  const urlDoc = await URL.findOne({ slug });

  if (!urlDoc) {
    return res.status(404).json({
      status: "error",
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Url not found or expired",
      details: "Such url is not present in our database",
      data: {},
    });
  }

  try {
    // Update states
    urlDoc.totalClicks = (urlDoc.totalClicks || 0) + 1;
    urlDoc.lastVisited = Date.now();
    await urlDoc.save();

    // collecting data for stats
    // slug | ip | userAgent | device | browser | os | referer | country | timestamp

    const userAgent = req.get("User-Agent") || "unknown";
    const referer = req.get("Referer") || null;

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";

    const { device, browser, os } = detectDeviceInfo(userAgent);

    const country = req.get("cf-ipcountry") || req.get("x-vercel-ip-country") || "unknown";

    try {
      await Click.create({
        urlId: urlDoc._id,
        slug,
        ip,
        userAgent,
        device,
        browser,
        os,
        country,
        referer,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        statusCode: 500,
        code: error?.errorCode || "INTERNAL_ERROR",
        message: error?.message || "Error in creating the route",
        details: error?.details,
        data: {},
      });
    }

    return res.redirect(urlDoc.originalUrl);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      code: error?.errorCode || "INTERNAL_ERROR",
      message: error?.message || "Error in redirection",
      details: error?.details,
      data: {},
    });
  }
};

export const getStats = async (req, res) => {
  const slug = req.params?.slug;

  const clicks = await Click.find({ slug: slug });

  if (!(clicks.length > 0)) {
    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "No Record Found.",
      data: {
        totalClicks: 0,
        devices: [],
        browsers: [],
        operatingSystems: [],
        countries: [],
      },
    });
  }

  try {
    const totalClicks = clicks.length;
    function updateCount(arr, key, value) {
      const found = arr.find(item => item[key] === value);
      if (found) {
        found.count++;
      } else {
        arr.push({ [key]: value, count: 1 });
      }
    }

    let devices = [];
    let browsers = [];
    let operatingSystems = [];
    let countries = [];

    clicks.forEach(click => {
      updateCount(devices, "device", click.device);
      updateCount(browsers, "browser", click.browser);
      updateCount(operatingSystems, "operatingSystem", click.os);
      updateCount(countries, "country", click.country);
    });

    const recordList = clicks.map(click => {
      return {
        slug: click.slug,
        ip: click.ip,
        device: click.device,
        browser: click.browser,
        operatingSystem: click.os,
        country: click.country,
        date: click.createdAt,
      };
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Record Found Successfully.",
      data: {
        totalClicks,
        devices,
        browsers,
        operatingSystems,
        countries,
        recordList,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      code: error?.errorCode || "INTERNAL_ERROR",
      message: error?.message || "Error in getting record",
      details: error?.details,
      data: {},
    });
  }
};
