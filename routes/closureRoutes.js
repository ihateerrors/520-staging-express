// const express=require("express"),router=express.Router(),Closure=require("../models/Project");router.put("/:id",(async(e,t)=>{try{const r=await Closure.findById(e.params.id);if(!r)return t.status(404).send("Closure not found");["startDate","endDate","postDate","removeDate","createdAt","updatedAt"].forEach((t=>{e.body[t]&&(e.body[t]=new Date(e.body[t]))})),["timingFeatures","activityType","impactType"].forEach((t=>{e.body[t]&&"string"==typeof e.body[t]&&(e.body[t]=e.body[t].split(", ").map((e=>e.trim())))})),e.body.mapData&&"string"==typeof e.body.mapData&&(e.body.mapData=JSON.parse(e.body.mapData)),Object.assign(r,e.body),await r.save(),t.json(r)}catch(e){t.status(500).send("Internal server error while updating closure.")}})),router.delete("/:id",(async(e,t)=>{try{const r=await Closure.findByIdAndDelete(e.params.id);if(!r)return t.status(404).send("Closure not found");t.send(r)}catch(e){t.status(500).send("Internal server error while deleting closure.")}})),module.exports=router;



const express = require('express');
const router = express.Router();
const multer = require('multer');
const Closure = require('../models/Project'); // Assuming this is your Closure model

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/') // make sure this directory already exists
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Middleware to handle multi-part form data
router.use(upload.single('image')); // 'image' is the field name for our file input

router.put('/:id', async (req, res) => {
    try {
        const closure = await Closure.findById(req.params.id);
        
        if (!closure) {
            return res.status(404).json({ error: 'Closure not found' });
        }

        // Map the incoming request body to update the closure fields
        // This assumes that the field names in the req.body are the same as those in your Closure model
        Object.keys(req.body).forEach(key => {
            if (req.body[key] && closure[key] !== undefined) { // Check for undefined as some fields might not exist in the model
                closure[key] = req.body[key];
            }
        });

        // Special handling for date fields
        const dateFields = ['startDate', 'endDate', 'postDate', 'removeDate', 'createdAt', 'updatedAt'];
        dateFields.forEach(field => {
            if (req.body[field]) {
                closure[field] = new Date(req.body[field]);
            }
        });

        // Special handling for image field
        if (req.file) {
            closure.imageUrl = req.file.path; // or however you wish to reference your image
        }

        // Special handling for array fields (e.g., 'timingFeatures', 'activityType', 'impactType') if they're sent as strings
        const arrayFields = ['timingFeatures', 'activityType', 'impactType'];
        arrayFields.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                closure[field] = req.body[field].split(',').map(item => item.trim()); // split string into array and trim whitespace
            }
        });

        // For mapData, assuming it's sent as a JSON string
        if (req.body.mapData) {
            closure.mapData = JSON.parse(req.body.mapData);
        }

        await closure.save();
        res.json(closure);

    } catch (e) {
        console.error('Error updating closure:', e);
        res.status(500).json({ error: 'Internal server error while updating closure.' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const closure = await Closure.findByIdAndDelete(req.params.id);

        if (!closure) {
            return res.status(404).json({ error: 'Closure not found' });
        }

        res.json(closure);

    } catch (e) {
        console.error('Error deleting closure:', e);
        res.status(500).json({ error: 'Internal server error while deleting closure.' });
    }
});

module.exports = router;



// end v2 new route










// end version 1 new route

// const express = require('express');
// const router = express.Router();
// const Closure = require('../models/Project'); 

// router.put('/:id', async (req, res) => {
//     try {
//         const closure = await Closure.findById(req.params.id);
        
//         if (!closure) {
//             return res.status(404).send('Closure not found');
//         }

   
//         if (req.body.startDate) {
//             req.body.startDate = new Date(req.body.startDate);
//         }

//         if (req.body.endDate) {
//             req.body.endDate = new Date(req.body.endDate);
//         }

//         if (req.body.postDate) {
//             req.body.postDate = new Date(req.body.postDate);
//         }

//         if (req.body.removeDate) {
//             req.body.removeDate = new Date(req.body.removeDate);
//         }

//         if (req.body.createdAt) {
//             req.body.createdAt = new Date(req.body.createdAt);
//         }

//         if (req.body.updatedAt) {
//             req.body.updatedAt = new Date(req.body.updatedAt);
//         }

//         Object.assign(closure, req.body);

      
//         await closure.save();

//         res.json(closure); 

//     } catch (e) {
//         console.error('Error updating closure:', e);
//         res.status(500).send('Internal server error while updating closure.');
//     }
// });

// router.delete('/:id', async (req, res) => {
//     try {
//         const closure = await Closure.findByIdAndDelete(req.params.id);
//         if (!closure) {
//             return res.status(404).send('Closure not found');
//         }
//         res.send(closure);
//     } catch (e) {
//         console.error('Error deleting closure:', e);
//         res.status(500).send('Internal server error while deleting closure.');
//     }
// });

// module.exports = router;






















// start new route proposed


// const express = require("express");
// const router = express.Router();
// const Closure = require("../models/Closure");

// router.put("/:id", async (req, res) => {
//     try {
//         const closure = await Closure.findById(req.params.id);
//         if (!closure) return res.status(404).send("Closure not found");

//         // Update closure fields
//         ['startDate', 'endDate', 'postDate', 'removeDate', 'createdAt', 'updatedAt'].forEach(field => {
//             if (req.body[field]) {
//                 closure[field] = new Date(req.body[field]);
//             }
//         });

//         await closure.save();
//         res.json(closure);

//     } catch (error) {
//         res.status(500).send("Internal server error while updating closure.");
//     }
// });

// router.delete("/:id", async (req, res) => {
//     try {
//         const closure = await Closure.findByIdAndDelete(req.params.id);
//         if (!closure) return res.status(404).send("Closure not found");
//         res.send(closure);
//     } catch (error) {
//         res.status(500).send("Internal server error while deleting closure.");
//     }
// });

// module.exports = router;
