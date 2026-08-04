const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

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

// Routes
// app.use("/auth", authRoutes);
// app.use("/users", userRoutes);
// app.use("/chat", chatRoutes);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Endpoint não encontrado."
    });
});

app.use((err, req, res, next) => {

    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Erro interno."
    });

});

module.exports = app;