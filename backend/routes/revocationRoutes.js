const express = require("express");

const {
    revokeCertificate,
} = require("../controllers/revocationController");

const {
    authMiddleware,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/:certificateId",
    authMiddleware,
    authorize("institution", "admin"),
    revokeCertificate
);

module.exports = router;