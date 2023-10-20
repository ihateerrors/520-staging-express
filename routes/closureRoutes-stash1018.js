// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");
// const Closure = require("../models/Project");
// const { uploadToAzure } = require("../utils/azureUpload");

// const storage = multer.diskStorage({
//   destination: function (e, r, t) {
//     t(null, "uploads/");
//   },
//   filename: function (e, r, t) {
//     t(null, Date.now() + "-" + r.originalname);
//   },
// });

// function fileFilter(req, file, cb) {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const mimetype = filetypes.test(file.mimetype);
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//   if (mimetype && extname) {
//     return cb(null, true);
//   }

//   cb("Error: File upload only supports the following filetypes - " + filetypes);
// }

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });

// router.put("/:id", (async (e, r) => {
//   upload.single('image')(e, r, async (err) => {
//     if (err instanceof multer.MulterError) {
//       return r.status(500).json({ error: err.message });
//     } else if (err) {
//       return r.status(500).json({ error: err });
//     }

//     try {
//       const t = await Closure.findById(e.params.id);
//       if (!t) return r.status(404).json({ error: "Closure not found" });

//       Object.keys(e.body).forEach((r => {
//         if (e.body[r] && t[r] !== undefined) {
//           t[r] = e.body[r];
//         }
//       }));

//       ["startDate", "endDate", "postDate", "removeDate", "createdAt", "updatedAt"].forEach((r => {
//         if (e.body[r]) {
//           t[r] = new Date(e.body[r]);
//         }
//       }));

//       if (e.file) {
//         const r = await uploadToAzure(e.file.buffer, e.file.originalname);
//         t.imageUrl = r;
//       }

//       ["timingFeatures", "activityType", "impactType"].forEach((r => {
//         if (e.body[r] && typeof e.body[r] === "string") {
//           t[r] = e.body[r].split(",").map(e => e.trim());
//         }
//       }));

//       if (e.body.mapData) {
//         t.mapData = JSON.parse(e.body.mapData);
//       }

//       await t.save();
//       r.json(t);
//     } catch (e) {
//       r.status(500).json({ error: "Internal server error while updating closure." });
//     }
//   });
// }));

// router.delete("/:id", (async (e, r) => {
//   try {
//     const t = await Closure.findByIdAndDelete(e.params.id);
//     if (!t) return r.status(404).json({ error: "Closure not found" });
//     r.json(t);
//   } catch (e) {
//     r.status(500).json({ error: "Internal server error while deleting closure." });
//   }
// }));

// module.exports = router;









const express=require("express"),router=express.Router(),multer=require("multer"),path=require("path"),Closure=require("../models/Project"),{uploadToAzure:uploadToAzure}=require("../utils/azureUpload"),storage=multer.diskStorage({destination:function(e,r,t){t(null,"uploads/")},filename:function(e,r,t){t(null,Date.now()+"-"+r.originalname)}});function fileFilter(e,r,t){const o=/jpeg|jpg|png|gif/,a=o.test(r.mimetype),s=o.test(path.extname(r.originalname).toLowerCase());if(a&&s)return t(null,!0);t("Error: File upload only supports the following filetypes - "+o)}const upload=multer({storage:storage,fileFilter:fileFilter});router.put("/:id",(async(e,r)=>{upload.single("image")(e,r,(async t=>{if(t instanceof multer.MulterError)return r.status(500).json({error:t.message});if(t)return r.status(500).json({error:t});try{const t=await Closure.findById(e.params.id);if(!t)return r.status(404).json({error:"Closure not found"});if(Object.keys(e.body).forEach((r=>{e.body[r]&&void 0!==t[r]&&(t[r]=e.body[r])})),["startDate","endDate","postDate","removeDate","createdAt","updatedAt"].forEach((r=>{e.body[r]&&(t[r]=new Date(e.body[r]))})),e.file){const r=await uploadToAzure(e.file.buffer,e.file.originalname);t.imageUrl=r}["timingFeatures","activityType","impactType"].forEach((r=>{e.body[r]&&"string"==typeof e.body[r]&&(t[r]=e.body[r].split(",").map((e=>e.trim())))})),e.body.mapData&&(t.mapData=JSON.parse(e.body.mapData)),await t.save(),r.json(t)}catch(e){r.status(500).json({error:"Internal server error while updating closure."})}}))})),router.delete("/:id",(async(e,r)=>{try{const t=await Closure.findByIdAndDelete(e.params.id);if(!t)return r.status(404).json({error:"Closure not found"});r.json(t)}catch(e){r.status(500).json({error:"Internal server error while deleting closure."})}})),module.exports=router;