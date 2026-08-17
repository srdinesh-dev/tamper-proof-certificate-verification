const express = require("express");

const {
    verifyCertificate,
} = require("../controllers/verificationController");

const router = express.Router();

router.get("/:certificateId", verifyCertificate);

module.exports = router;