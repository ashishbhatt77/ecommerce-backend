const path = require("path"); // Node.js path module import
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multi-Vendor eCommerce API",
      version: "1.0.0",
      description: "MERN stack multi-vendor eCommerce backend API documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Server",
      },
    ],
  },
  apis: [path.join(__dirname, "swagger", "*.yaml")], // Absolute path to the YAML files
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;
