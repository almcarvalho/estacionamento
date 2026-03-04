const express = require("express");
const parkingController = require("../controllers/parkingController");

const router = express.Router();

router.post("/init", parkingController.initParking);
router.post("/checkin", parkingController.checkin);
router.post("/checkout", parkingController.checkout);
router.get("/status", parkingController.status);
router.get("/tickets/:ticketId", parkingController.getTicket);
router.get("/events", parkingController.events);

module.exports = router;
