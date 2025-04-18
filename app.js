const express = require("express");
const app = express();
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const listingRoute = require("./routes/listingRoute.js");
const { listingSchema } = require("./schema.js");
const cors = require("cors");

// Database connection
mongoose.connect('mongodb+srv://ritu05491:ritu2312@myproject.chwmz.mongodb.net/?retryWrites=true&w=majority&appName=myProject')
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(cors());

//home route
app.get("/", (req, res) => {
    res.render("home.ejs");
});

//index route
app.get("/listing", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings }); // Corrected the path
}));

//show route
app.get("/listing/:id/show", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing }); 
}));

//create route
app.get("/listing/new", (req, res) => {
    res.render("listings/new.ejs");
});

//post route
app.post("/listing", wrapAsync(async (req, res) => {
    // Validate req.body.listing
    let result = listingSchema.validate(req.body);
    console.log(result);
    const newListing = new Listing(req.body);
    await newListing.save();
    res.redirect("/listing");
}));

//edit route
app.get("/listing/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//update route
app.put("/listing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new expressError(400, "Invalid ObjectId");
    }
    if (!req.body.listing) {
        throw new expressError(400, "Invalid listing data");
    };
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listing/${id}/show`); // Interpolate the id value
}));

//delete route
app.delete("/listing/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));

app.use((req, res, next) => {
    const err = new expressError(404, "Page Not Found");
    next(err);
});

//error handling
app.use((err, req, res, next) => {
    let { statusCode = 500, message= "something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { err});
});

app.listen(2020,()=>{
    console.log("server is connected on port 2020");
});
