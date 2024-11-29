const express = require("express")
const routes = require("./routes")
const mongoose = require("mongoose")
const app = express();
mongoose
	.connect("mongodb://localhost:27017/GameDataTest", {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})

	.then(() => {
		console.log("Connected to MongoDB!");
	})
	.catch((err) => {
		console.error("Failed to connect to MongoDB:", err);
		process.exit(1); // Thoát nếu không thể kết nối
	});


// Middleware để xử lý JSON requests
app.use(express.json()); // express.json() thay cho body-parser


// Đăng ký routes API
app.use("/api", routes);

app.listen(5000, () => {
	console.log("Server has started!")
});

