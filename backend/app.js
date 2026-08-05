const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

// middlewares
const authMiddleware = require("./middlewares/authMiddleware");

// Rotas
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({
    limit: "100mb"
}));

app.use(express.urlencoded({
    extended: true
}));

app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Papo Chat API"
    });
});

app.get("/auth/validate", authMiddleware, (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Validado"
    })
});

// Routes
app.use("/auth", authRoute);
app.use("/users", authMiddleware, userRoute);
// app.use("/chat", chatRoutes);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Endpoint não encontrado."
    });
});

app.use((err, req, res, next) => {
    return res.status(500).json({
        success: false,
        message: err.message
    });

});

module.exports = app;