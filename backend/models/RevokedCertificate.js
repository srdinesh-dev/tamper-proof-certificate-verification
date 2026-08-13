const mongoose = require("mongoose");

const revokedCertificateSchema = new mongoose.Schema(
    {
        certificate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certificate",
            required: true,
            unique: true,
        },

        institution: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
        },

        revokedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "RevokedCertificate",
    revokedCertificateSchema
);