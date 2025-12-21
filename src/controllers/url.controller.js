import { nanoid } from "nanoid";
import { URL } from "../model/url.model.js";
import { detectDeviceInfo } from "../utils/detectDeviceInfo.js";
import { Click } from "../model/click.model.js";
import { url } from "inspector";

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
      createdBy: req?.user?.id || null,
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
    // if it's created by a guest user, then simply redirect
    if (!urlDoc?.createdBy) {
      return res.redirect(urlDoc.originalUrl);
    }
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
  // User Verification (Checking if Link is created by logged in user)
  const slug = req.params?.slug;

  // Find Url
  const url = await URL.findOne({ slug }, { createdBy: 1 });

  // See if url or user author is not present
  if (!url || !url?.createdBy) {
    return res.status(404).json({
      statusCode: 404,
      success: false,
      message: "No Record Found or un-authorized access.",
      error: new Error("No Record Found or un-authorized access."),
    });
  }

  // Verify if loggedin user is author of requested url
  if (req?.user?.id !== url.createdBy.toString()) {
    return res.status(401).json({
      statusCode: 401,
      success: false,
      message: "Un-authorized Access",
      error: new Error("Un-authorized Access"),
    });
  }

  // Find clicks and generate report
  const clicks = await Click.find({ slug: slug });

  if (!(clicks.length > 0)) {
    return res.status(404).json({
      status: "failure",
      statusCode: 404,
      message: "No Record Found.",
      data: null,
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

export const getUrls = async (req, res) => {
  const userId = req?.user?.id;

  if (!userId) {
    return res.status(401).json({
      statusCode: 401,
      success: false,
      message: "Un-authorized access or User is not loggedin",
      error: new Error("Un-authorized access or User is not loggedin"),
    });
  }

  const urls = await URL.find(
    { createdBy: userId },
    { _id: true, originalUrl: true, totalClicks: true, slug: true }
  );

  if (!urls.length > 0) {
    return res.status(404).json({
      statusCode: 404,
      success: false,
      message: "No URL Found",
      error: new Error("No URL found"),
    });
  }

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: "URL retrieved successfully.",
    data: urls,
  });
};

export const getNumberOfAllUrls = async (req, res) => {
  try {
    const count = await URL.countDocuments();
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Count successfully created",
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error?.message || "SERVER SIDE ERROR",
      error,
    });
  }
};

export const deleteUrl = async (req, res) => {
  const slug = req.params?.slug;

  // Validate slug
  if (!slug) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      message: "Slug is required",
      error: new Error("Slug is required"),
      data: null,
    });
  }

  // Deleting URL and associated clicks
  try {
    const deletedUrl = await URL.findOneAndDelete({ slug, createdBy: req?.user?.id });
    if (!deletedUrl) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "URL not found or you do not have permission to delete it",
        error: new Error("URL not found or unauthorized"),
        data: null,
      });
    }

    await Click.deleteMany({ urlId: deletedUrl._id });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "URL and associated clicks deleted successfully",
      data: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Server Error while deleting URL",
      error: error,
      data: null,
    });
  }
};
