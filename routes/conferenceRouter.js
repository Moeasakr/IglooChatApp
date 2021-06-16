"use strict";

const express = require("express");
const router = express.Router();
const conferenceController = require("../controllers/conferenceController");


router.get("/", conferenceController.index);


router.get("/about-us", conferenceController.aboutUs);

router.get("/faq", conferenceController.faq);


router.get("/mongo-read-example", conferenceController.mongoReadExample);

router.get("/mongo-write-example", conferenceController.mongoWriteExample);

router.get("/mongo-showall-example", conferenceController.mongoShowAllExample);

// router.get("/lobby", conferenceController.lobby);

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.post("/send", conferenceController.sendInviteEmail);

router.post("/newRoom", conferenceController.newRoom);

router.get("/register", conferenceController.register);

router.post("/register", conferenceController.registerAuth);

router.get("/login", conferenceController.login);

router.post("/login", conferenceController.loginAuth);

router.get("/:room", conferenceController.connectToRoom);

router.post("/:room", conferenceController.connectToRoom);

router.get("/servererror", conferenceController.serverError);


router.use("/", conferenceController.pageNotFoundError);

module.exports = router;
