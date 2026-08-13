const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Institution = require("../models/Institution");

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        }
    );
};

const register = async (req, res) => {
    try {
        const { name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const existingInstitution = await Institution.findOne({ email });

        if (existingInstitution) {
            return res.status(409).json({
                message: "An account with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const institution = await Institution.create({
            name,
            email,
            password: hashedPassword,
            role: "institution",
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: institution._id,
                name: institution.name,
                email: institution.email,
                role: institution.role,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Server error during registration",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const institution = await Institution.findOne({ email });

        if (!institution) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            institution.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(institution);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: institution._id,
                name: institution.name,
                email: institution.email,
                role: institution.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error during login",
        });
    }
};

module.exports = {
    register,
    login,
};