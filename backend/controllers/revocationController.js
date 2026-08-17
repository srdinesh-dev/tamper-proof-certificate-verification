const Certificate = require("../models/Certificate");
const RevokedCertificate = require("../models/RevokedCertificate");

const revokeCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                message: "Revocation reason is required",
            });
        }

        const certificate = await Certificate.findOne({
            certificateId,
        });

        if (!certificate) {
            return res.status(404).json({
                message: "Certificate not found",
            });
        }

        if (
            certificate.institution.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "You can only revoke your own certificates",
            });
        }

        const existingRevocation =
            await RevokedCertificate.findOne({
                certificate: certificate._id,
            });

        if (existingRevocation) {
            return res.status(400).json({
                message: "Certificate is already revoked",
            });
        }

        const revokedCertificate =
            await RevokedCertificate.create({
                certificate: certificate._id,
                institution: certificate.institution,
                reason,
                revokedBy: req.user.id,
            });

        res.status(201).json({
            message: "Certificate revoked successfully",
            revocation: {
                id: revokedCertificate._id,
                certificateId: certificate.certificateId,
                reason: revokedCertificate.reason,
                institution: revokedCertificate.institution,
                revokedBy: revokedCertificate.revokedBy,
                revokedAt: revokedCertificate.revokedAt,
            },
        });
    } catch (error) {
        console.error("Certificate revocation error:", error);

        res.status(500).json({
            message: "Server error while revoking certificate",
        });
    }
};

module.exports = {
    revokeCertificate,
};