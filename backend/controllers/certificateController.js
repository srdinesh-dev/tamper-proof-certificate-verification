const crypto = require("crypto")
const path = require("path")
const QRCode = require("qrcode")
const PDFDocument = require("pdfkit")

const Certificate = require("../models/Certificate")
const RevokedCertificate = require("../models/RevokedCertificate")
const Institution = require("../models/Institution")

const generateHash = (data) => {
    return crypto
        .createHash("sha256")
        .update(data)
        .digest("hex")
}

const generateCertificatePdf = async (certificate) => {
    const certificateId = certificate.certificateId

    const verificationUrl =
        `https://tamper-proof-certificate-verificati.vercel.app/?certificateId=${certificateId}`

    const logoPath = path.join(
        __dirname,
        "../assets/certify-logo.png"
    )

    const qrCodeDataUrl = await QRCode.toDataURL(
        verificationUrl,
        {
            width: 300,
            margin: 2,
            color: {
                dark: "#172033",
                light: "#FFFFFF"
            }
        }
    )

    const pdfBuffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: "A4",
            layout: "portrait",
            margin: 0
        })

        const chunks = []

        doc.on("data", (chunk) => {
            chunks.push(chunk)
        })

        doc.on("end", () => {
            resolve(Buffer.concat(chunks))
        })

        doc.on("error", reject)

        const pageWidth = 595.28
        const pageHeight = 841.89

        const navy = "#172033"
        const gold = "#B08D57"
        const lightGold = "#D8C39A"
        const cream = "#FBF9F3"
        const muted = "#667085"

        doc.rect(
            0,
            0,
            pageWidth,
            pageHeight
        ).fill(cream)

        doc.rect(
            22,
            22,
            pageWidth - 44,
            pageHeight - 44
        )
            .lineWidth(2)
            .stroke(navy)

        doc.rect(
            31,
            31,
            pageWidth - 62,
            pageHeight - 62
        )
            .lineWidth(1)
            .stroke(gold)

        doc.lineWidth(2)

        doc.moveTo(48, 95)
            .lineTo(105, 95)
            .stroke(gold)

        doc.moveTo(
            pageWidth - 105,
            95
        )
            .lineTo(
                pageWidth - 48,
                95
            )
            .stroke(gold)

        doc.circle(
            pageWidth / 2,
            95,
            29
        )
            .lineWidth(2)
            .stroke(navy)

        doc.circle(
            pageWidth / 2,
            95,
            23
        )
            .lineWidth(1)
            .stroke(gold)

        doc.image(
            logoPath,
            pageWidth / 2 - 20,
            75,
            {
                fit: [40, 40],
                align: "center",
                valign: "center"
            }
        )

        doc.font("Helvetica-Bold")
            .fontSize(10)
            .fillColor(gold)
            .text(
                "CERTIFICATE OF ACHIEVEMENT",
                0,
                140,
                {
                    width: pageWidth,
                    align: "center",
                    characterSpacing: 2
                }
            )

        doc.font("Times-Bold")
            .fontSize(38)
            .fillColor(navy)
            .text(
                "CERTIFICATE",
                0,
                166,
                {
                    width: pageWidth,
                    align: "center"
                }
            )

        doc.font("Helvetica")
            .fontSize(13)
            .fillColor(muted)
            .text(
                "This certificate is proudly presented to",
                0,
                225,
                {
                    width: pageWidth,
                    align: "center"
                }
            )

        doc.font("Times-Bold")
            .fontSize(31)
            .fillColor(navy)
            .text(
                certificate.studentName,
                70,
                263,
                {
                    width: pageWidth - 140,
                    align: "center"
                }
            )

        doc.moveTo(145, 310)
            .lineTo(
                pageWidth - 145,
                310
            )
            .lineWidth(1)
            .stroke(lightGold)

        doc.font("Helvetica")
            .fontSize(13)
            .fillColor(muted)
            .text(
                "for successfully completing the course",
                0,
                335,
                {
                    width: pageWidth,
                    align: "center"
                }
            )

        doc.font("Helvetica-Bold")
            .fontSize(21)
            .fillColor(navy)
            .text(
                certificate.course,
                60,
                365,
                {
                    width: pageWidth - 120,
                    align: "center"
                }
            )

        doc.font("Helvetica")
            .fontSize(12)
            .fillColor(muted)
            .text(
                "with the grade",
                0,
                415,
                {
                    width: pageWidth,
                    align: "center"
                }
            )

        doc.font("Helvetica-Bold")
            .fontSize(24)
            .fillColor(gold)
            .text(
                certificate.grade,
                0,
                438,
                {
                    width: pageWidth,
                    align: "center"
                }
            )

        doc.roundedRect(
            125,
            485,
            pageWidth - 250,
            65,
            8
        )
            .fillOpacity(0.55)
            .fill("#F3EFE4")
            .fillOpacity(1)
            .lineWidth(1)
            .stroke(lightGold)

        doc.font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(muted)
            .text(
                "ISSUE DATE",
                145,
                501,
                {
                    width: 120,
                    align: "center"
                }
            )

        const normalizedIssueDate =
            new Date(certificate.issueDate)
                .toISOString()
                .split("T")[0]

        doc.font("Helvetica")
            .fontSize(12)
            .fillColor(navy)
            .text(
                normalizedIssueDate,
                145,
                520,
                {
                    width: 120,
                    align: "center"
                }
            )

        doc.font("Helvetica-Bold")
            .fontSize(9)
            .fillColor(muted)
            .text(
                "CERTIFICATE ID",
                315,
                501,
                {
                    width: 135,
                    align: "center"
                }
            )

        doc.font("Helvetica")
            .fontSize(9)
            .fillColor(navy)
            .text(
                certificateId,
                300,
                520,
                {
                    width: 165,
                    align: "center"
                }
            )

        const qrCodeBuffer = Buffer.from(
            qrCodeDataUrl.split(",")[1],
            "base64"
        )

        doc.image(qrCodeBuffer, {
            fit: [90, 90],
            x: pageWidth / 2 - 45,
            y: 590
        })

        doc.font("Helvetica")
            .fontSize(8)
            .fillColor(muted)
            .text(
                "SCAN TO VERIFY AUTHENTICITY",
                0,
                685,
                {
                    width: pageWidth,
                    align: "center",
                    characterSpacing: 1
                }
            )

        doc.moveTo(70, 735)
            .lineTo(220, 735)
            .lineWidth(1)
            .stroke(navy)

        doc.moveTo(
            pageWidth - 220,
            735
        )
            .lineTo(
                pageWidth - 70,
                735
            )
            .lineWidth(1)
            .stroke(navy)

        doc.font("Helvetica")
            .fontSize(9)
            .fillColor(muted)
            .text(
                "AUTHORIZED SIGNATURE",
                70,
                742,
                {
                    width: 150,
                    align: "center"
                }
            )

        doc.font("Helvetica")
            .fontSize(9)
            .fillColor(muted)
            .text(
                "INSTITUTION",
                pageWidth - 220,
                742,
                {
                    width: 150,
                    align: "center"
                }
            )

        doc.font("Helvetica")
            .fontSize(7)
            .fillColor("#8A8F98")
            .text(
                "This certificate is digitally secured using SHA-256 cryptographic verification.",
                50,
                790,
                {
                    width: pageWidth - 100,
                    align: "center"
                }
            )

        doc.end()
    })

    return pdfBuffer
}

const issueCertificate = async (req, res) => {
    try {
        const {
            studentName,
            course,
            grade,
            issueDate
        } = req.body

        if (
            !studentName ||
            !course ||
            !grade ||
            !issueDate
        ) {
            return res.status(400).json({
                message:
                    "Student name, course, grade and issue date are required"
            })
        }

        const previousCertificate =
            await Certificate.findOne({
                institution: req.user.id
            }).sort({
                createdAt: -1
            })

        const previousHash =
            previousCertificate
                ? previousCertificate.hash
                : "GENESIS"

        const certificateId =
            `CERT-${Date.now()}-${crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase()}`

        const normalizedIssueDate =
            new Date(issueDate)
                .toISOString()
                .split("T")[0]

        const certificateData = {
            certificateId,
            studentName,
            course,
            grade,
            issueDate: normalizedIssueDate,
            institution: req.user.id
        }

        const dataString =
            JSON.stringify(certificateData)

        const hash = generateHash(
            dataString + previousHash
        )

        const certificate =
            await Certificate.create({
                certificateId,
                studentName,
                course,
                grade,
                issueDate: normalizedIssueDate,
                institution: req.user.id,
                hash,
                previousHash
            })

        const verificationUrl =
            `https://tamper-proof-certificate-verificati.vercel.app/?certificateId=${certificateId}`

        const pdfBuffer =
            await generateCertificatePdf(
                certificate
            )

        res.status(201).json({
            message:
                "Certificate issued successfully",
            certificate: {
                id: certificate._id,
                certificateId:
                    certificate.certificateId,
                studentName:
                    certificate.studentName,
                course:
                    certificate.course,
                grade:
                    certificate.grade,
                issueDate:
                    certificate.issueDate,
                hash:
                    certificate.hash,
                previousHash:
                    certificate.previousHash,
                verificationUrl
            },
            pdf:
                pdfBuffer.toString("base64")
        })
    } catch (error) {
        console.error(
            "Certificate issuance error:",
            error
        )

        res.status(500).json({
            message:
                "Server error while issuing certificate"
        })
    }
}

const getCertificates = async (req, res) => {
    try {
        const filter =
            req.user.role === "admin"
                ? {}
                : {
                      institution:
                          req.user.id
                  }

        const certificates =
            await Certificate.find(filter)
                .populate(
                    "institution",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })

        const certificateIds =
            certificates.map(
                (certificate) =>
                    certificate._id
            )

        const revokedCertificates =
            await RevokedCertificate.find({
                certificate: {
                    $in: certificateIds
                }
            })

        const revokedMap = new Map()

        revokedCertificates.forEach(
            (revoked) => {
                revokedMap.set(
                    revoked.certificate.toString(),
                    revoked
                )
            }
        )

        const formattedCertificates =
            certificates.map(
                (certificate) => {
                    const revoked =
                        revokedMap.get(
                            certificate._id.toString()
                        )

                    return {
                        _id:
                            certificate._id,
                        certificateId:
                            certificate.certificateId,
                        studentName:
                            certificate.studentName,
                        course:
                            certificate.course,
                        grade:
                            certificate.grade,
                        issueDate:
                            certificate.issueDate,
                        hash:
                            certificate.hash,
                        previousHash:
                            certificate.previousHash,
                        institution:
                            certificate.institution,
                        status:
                            revoked
                                ? "Revoked"
                                : "Active",
                        revokedAt:
                            revoked
                                ? revoked.revokedAt
                                : null,
                        reason:
                            revoked
                                ? revoked.reason
                                : null
                    }
                }
            )

        const totalCertificates =
            formattedCertificates.length

        const revokedCount =
            formattedCertificates.filter(
                (certificate) =>
                    certificate.status ===
                    "Revoked"
            ).length

        const activeCount =
            totalCertificates -
            revokedCount

        res.status(200).json({
            count:
                totalCertificates,
            totalCertificates,
            activeCertificates:
                activeCount,
            revokedCertificates:
                revokedCount,
            certificates:
                formattedCertificates
        })
    } catch (error) {
        console.error(
            "Get certificates error:",
            error
        )

        res.status(500).json({
            message:
                "Server error while fetching certificates"
        })
    }
}

const getCertificateById = async (
    req,
    res
) => {
    try {
        const {
            certificateId
        } = req.params

        const certificate =
            await Certificate.findOne({
                certificateId
            }).populate(
                "institution",
                "name email"
            )

        if (!certificate) {
            return res.status(404).json({
                message:
                    "Certificate not found"
            })
        }

        if (
            req.user.role !== "admin" &&
            certificate.institution._id.toString() !==
                req.user.id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Access denied"
            })
        }

        const revokedCertificate =
            await RevokedCertificate.findOne({
                certificate:
                    certificate._id
            })

        res.status(200).json({
            certificate: {
                id:
                    certificate._id,
                certificateId:
                    certificate.certificateId,
                studentName:
                    certificate.studentName,
                course:
                    certificate.course,
                grade:
                    certificate.grade,
                issueDate:
                    certificate.issueDate,
                hash:
                    certificate.hash,
                previousHash:
                    certificate.previousHash,
                institution:
                    certificate.institution,
                createdAt:
                    certificate.createdAt
            },
            status:
                revokedCertificate
                    ? "Revoked"
                    : "Active",
            revocation:
                revokedCertificate
                    ? {
                          reason:
                              revokedCertificate.reason,
                          revokedAt:
                              revokedCertificate.revokedAt
                      }
                    : null
        })
    } catch (error) {
        console.error(
            "Get certificate error:",
            error
        )

        res.status(500).json({
            message:
                "Server error while fetching certificate"
        })
    }
}

const downloadCertificate = async (
    req,
    res
) => {
    try {
        const {
            certificateId
        } = req.params

        const certificate =
            await Certificate.findOne({
                certificateId
            }).populate(
                "institution",
                "name email"
            )

        if (!certificate) {
            return res.status(404).json({
                message:
                    "Certificate not found"
            })
        }

        if (
            req.user.role !== "admin" &&
            certificate.institution._id.toString() !==
                req.user.id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Access denied"
            })
        }

        const pdfBuffer =
            await generateCertificatePdf(
                certificate
            )

        res.setHeader(
            "Content-Type",
            "application/pdf"
        )

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${certificateId}.pdf"`
        )

        res.setHeader(
            "Content-Length",
            pdfBuffer.length
        )

        res.send(pdfBuffer)
    } catch (error) {
        console.error(
            "Certificate download error:",
            error
        )

        res.status(500).json({
            message:
                "Server error while downloading certificate"
        })
    }
}

const getInstitutions = async (
    req,
    res
) => {
    try {
        if (
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message:
                    "Admin access required"
            })
        }

        const institutions =
            await Institution.find({
                role: "institution"
            })
                .select(
                    "_id name email createdAt"
                )
                .sort({
                    createdAt: -1
                })

        res.status(200).json({
            count:
                institutions.length,
            institutions
        })
    } catch (error) {
        console.error(
            "Get institutions error:",
            error
        )

        res.status(500).json({
            message:
                "Server error while fetching institutions"
        })
    }
}

module.exports = {
    issueCertificate,
    getCertificates,
    getCertificateById,
    getInstitutions,
    downloadCertificate
}