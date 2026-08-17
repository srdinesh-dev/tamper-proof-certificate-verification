const crypto = require("crypto");

const Certificate = require("../models/Certificate");
const RevokedCertificate = require("../models/RevokedCertificate");

const generateHash = (data) => {
    return crypto
        .createHash("sha256")
        .update(data)
        .digest("hex");
};

const verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findOne({
            certificateId,
        });

        if (!certificate) {
            return res.status(404).json({
                status: "Not Found",
                message: "Certificate not found",
            });
        }

        const revokedCertificate =
            await RevokedCertificate.findOne({
                certificate: certificate._id,
            });

        if (revokedCertificate) {
            return res.status(200).json({
                status: "Revoked",
                message: "This certificate has been revoked",
                certificate: {
                    certificateId: certificate.certificateId,
                    studentName: certificate.studentName,
                    course: certificate.course,
                    grade: certificate.grade,
                    issueDate: certificate.issueDate,
                },
                revokedAt: revokedCertificate.revokedAt,
                reason: revokedCertificate.reason,
            });
        }

        const normalizedIssueDate = certificate.issueDate
            .toISOString()
            .split("T")[0];

        const certificateData = {
            certificateId: certificate.certificateId,
            studentName: certificate.studentName,
            course: certificate.course,
            grade: certificate.grade,
            issueDate: normalizedIssueDate,
            institution: certificate.institution,
        };

        const dataString = JSON.stringify(certificateData);

        const recalculatedHash = generateHash(
            dataString + certificate.previousHash
        );

        if (recalculatedHash !== certificate.hash) {
            return res.status(200).json({
                status: "Tampered",
                message: "Certificate data has been modified",
                certificate: {
                    certificateId: certificate.certificateId,
                    studentName: certificate.studentName,
                    course: certificate.course,
                    grade: certificate.grade,
                    issueDate: certificate.issueDate,
                },
            });
        }

        return res.status(200).json({
            status: "Verified",
            message: "Certificate is authentic",
            certificate: {
                certificateId: certificate.certificateId,
                studentName: certificate.studentName,
                course: certificate.course,
                grade: certificate.grade,
                issueDate: certificate.issueDate,
            },
        });
    } catch (error) {
        console.error(
            "Certificate verification error:",
            error
        );

        return res.status(500).json({
            status: "Error",
            message: "Internal server error",
        });
    }
};

module.exports = {
    verifyCertificate,
};