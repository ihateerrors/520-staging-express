const express = require("express"),
  mongoose = require("mongoose"),
  multer = require("multer"),
  router = express.Router(),
  { uploadToAzure: uploadToAzure } = require("../utils/azureUpload"),
  Project = require("../models/Project"),
  formatDate = require("../utils/dateHelpers"),
  ensureAuthenticated = require("../middlewares/auth"),
  storage = multer.memoryStorage(),
  upload = multer({ storage: storage });
  
router.get("/pdf-upload", (e, t) => {
  t.render("pdf-upload");
}),
  router.post(
    "/upload-pdf",
    upload.fields([{ name: "montlakeNoiseReport" }, { name: "i5NoiseReport" }]),
    async (e, t) => {
      if (e.files.montlakeNoiseReport) {
        const t = e.files.montlakeNoiseReport[0];
        await uploadToAzure(t.buffer, t.originalname);
      }
      if (e.files.i5NoiseReport) {
        const t = e.files.i5NoiseReport[0];
        await uploadToAzure(t.buffer, t.originalname);
      }
      t.redirect("/dashboard");
    }
  ),
  router.get("/api/test", (e, t) => t.send("Test successful!")),
  router.get("/api/projects/mapData", async (e, t) => {
    try {
      const { startDate: r, endDate: a, types: s } = e.query,
        o = s ? s.split(",") : [],
        n = {};
      o.length && !o.includes("all") && (n.activityType = { $in: o }),
        r &&
          a &&
          ((n.startDate = { $gte: new Date(r) }),
          (n.endDate = { $lte: new Date(a) }));
      const c = await Project.find(n).select("mapData activityType");
      t.json({ projects: c });
    } catch (e) {
      t.status(500).json({ error: "Internal Server Error" });
    }
  }),
  router.post("/api/projects/mapData", async (e, t) => {
    const r = e.body,
      a = r.activityTypes || [];
    let s = {};
    a.length && !a.includes("all") && (s.activityType = { $in: a }),
      (s.startDate = { $gte: new Date(r.startDate) }),
      (s.endDate = { $lte: new Date(r.endDate) });
    try {
      const e = await Project.find(s).select("mapData activityType");
      t.json({ projects: e });
    } catch (e) {
      t.status(500).json({ error: "Internal Server Error" });
    }
  }),

//   this is the route 
  router.get("/projects/:projectId", async (e, t) => {
    try {
      const r = e.params.projectId;

      if (!mongoose.Types.ObjectId.isValid(r))
        return void t.status(400).send("Invalid Project ID");
      const a = await Project.findById(r);
      if (!a) return void t.status(404).send("Project not found");
      t.render("projectDetails", { closure: a, formatDate: formatDate });
    } catch (e) {
      t.status(500).send("Internal Server Error");
    }
  }),
  
//   this is the route END




  router.get("/api/projects", async (e, t) => {
    try {
      let r = {};
      e.query.startDate &&
        (r.startDate = { $gte: new Date(e.query.startDate) }),
        e.query.endDate && (r.endDate = { $lte: new Date(e.query.endDate) }),
        e.query.types && (r.activityType = { $in: e.query.types.split(",") }),
        e.query.cameras && (r.cameras = "true" === e.query.cameras);
      const a = await Project.find(r);
      t.json(a);
    } catch (e) {
      t.status(500).send("Internal Server Error");
    }
  }),
  router.get("/projectForm", ensureAuthenticated, (e, t) => {
    t.render("projectForm", {
      success_msg: e.flash("success_msg"),
      error_msg: e.flash("error_msg"),
    });
  }),
  router.get("/dashboard", ensureAuthenticated, async (e, t) => {
    try {
      const e = await Project.find({}),
        r = Project.schema.path("activityType").caster.enumValues,
        a = Project.schema.path("timingFeatures").caster.enumValues,
        s = Project.schema.path("impactType").caster.enumValues;
      0 === e.length
        ? t.render("dashboard", {
            closures: [],
            allActivityTypes: r,
            allTimingFeatures: a,
            allImpactTypes: s,
            message: "No closures available.",
          })
        : t.render("dashboard", {
            closures: e,
            allActivityTypes: r,
            allTimingFeatures: a,
            allImpactTypes: s,
          });
    } catch (e) {
      t.status(500).send("Internal Server Error");
    }
  }),
  router.post("/api/projects", upload.single("file"), async (e, t) => {
    try {
      if (e.file && e.file.buffer) {
        const t = await uploadToAzure(e.file.buffer, e.file.originalname);
        e.body.imageUrl = t;
      }
      const r = new Project(e.body);
      await r.save(),
        e.flash("success_msg", "Construction event created successfully."),
        t.redirect("/projectForm");
    } catch (r) {
      if ("ValidationError" === r.name) {
        let a = Object.values(r.errors).map((e) => e.message);
        e.flash("error_msg", "Error in creating the event: " + a.join(", ")),
          t.redirect("/projectForm");
      } else
        e.flash("error_msg", "Internal server error, yo"),
          t.redirect("/projectForm");
    }
  }),
  router.get("/latest-closures", async (e, t) => {
    try {
      const e = new Date();
      e.setHours(0, 0, 0, 0);
      const r = await Project.find({
        endDate: { $gte: e },
        postDate: { $lte: e },
      })
        .sort({ postDate: -1 })
        .limit(8)
        .exec();
      t.json(r);
    } catch (e) {
      t.status(500).send("Internal Server Error");
    }
  });
const fetchRecentClosures = async () => {
  try {
    return await Project.find({}).limit(10);
  } catch (e) {
    throw e;
  }
};
router.get("/api/projects/:projectId/mapData", async (e, t) => {
  try {
    const r = e.params.projectId;
    if (!mongoose.Types.ObjectId.isValid(r))
      return void t.status(400).send("Invalid Project ID");
    const a = await Project.findById(r);
    if (!a) return void t.status(404).send("Project not found");
    if (!a.mapData)
      return void t.status(404).send("Map data not found for the project");
    t.json({ _id: a._id, mapData: a.mapData });
  } catch (e) {
    t.status(500).send("Internal Server Error");
  }
}),
  (module.exports = {
    router: router,
    fetchRecentClosures: fetchRecentClosures,
    upload: upload,
  });













