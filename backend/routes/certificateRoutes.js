const express = require("express")

const router = express.Router()

const {
    issueCertificate,
    getCertificates,
    getCertificateById,
    getInstitutions,
    downloadCertificate
} = require("../controllers/certificateController")

const {
    authMiddleware,
    authorize
} = require("../middleware/authMiddleware")

router.post(
    "/issue",
    authMiddleware,
    authorize("institution", "admin"),
    issueCertificate
)

router.get(
    "/",
    authMiddleware,
    authorize("institution", "admin"),
    getCertificates
)

router.get(
    "/institutions",
    authMiddleware,
    authorize("admin"),
    getInstitutions
)

router.get(
    "/download/:certificateId",
    authMiddleware,
    authorize("institution", "admin"),
    downloadCertificate
)

router.get(
    "/:certificateId",
    authMiddleware,
    authorize("institution", "admin"),
    getCertificateById
)

module.exports = router