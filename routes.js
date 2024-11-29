const express = require("express")
const User = require("./models/User")
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require("cors");

const router = express.Router()
const app = express()
app.use(express.json());
app.use(cors());


// Route /register
router.post("/register", async (req, res) => {
    console.log("Request Body:", req.body); // In ra body nhận được

    // Kiểm tra xem username có tồn tại chưa
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
        return res.status(400).json({ message: "Username đã tồn tại!" });
    }

    try {
        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        console.log("Mật khẩu đã mã hóa:", hashedPassword);

        // Lưu thông tin người dùng vào cơ sở dữ liệu
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json(newUser);  // Trả về dữ liệu người dùng sau khi lưu thành công
    } catch (error) {
        console.error("Lỗi khi đăng ký người dùng:", error);
        res.status(500).json({ error: error.message });
    }
});


// Route /login
router.post("/login", async (req, res) => {
    console.log("Request Body:", req.body); // In ra body nhận được

    // Kiểm tra người dùng trong cơ sở dữ liệu
    const user = await User.findOne({ username: req.body.username });

    // Nếu không tìm thấy user, trả về lỗi
    if (!user) {
        return res.status(401).json({ message: 'Username hoặc password không đúng!' });
    }

    // So sánh mật khẩu với mật khẩu đã mã hóa trong cơ sở dữ liệu
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    // Nếu mật khẩu không khớp, trả về lỗi
    if (!isMatch) {
        return res.status(401).json({ message: 'Username hoặc password không đúng!' });
    }

    // Tạo JWT token nếu đăng nhập thành công
    const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' });

    // Trả về thông tin đăng nhập thành công
    res.status(200).json({ message: 'Login successful', token });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]; // Lấy Authorization từ headers
    console.log(req.headers["authorization"]);
    const token = authHeader && authHeader.split(" ")[1]; // Lấy token sau "Bearer "

    if (!token) {
        return res.status(401).json({ message: "Token không được cung cấp!" });
    }

    jwt.verify(token, "yourSecretKey", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ!" });
        }

        req.user = user; // Gán thông tin user giải mã từ token
        next(); // Tiếp tục xử lý request
    });
};

router.patch("/patch", authenticateToken, async (req, res) => {
   
    try {
        // Kiểm tra xem user có tồn tại không
        const post = await User.findOne({ username: req.body.username });

        if (!post) {
            return res.status(404).json({ error: "Người dùng không tồn tại!" });
        }

        // Cập nhật dữ liệu nếu có trong request
        if (req.body.title) {
            post.title = req.body.title;
        }

        if (req.body.username) {
            post.username = req.body.username;
        }

        // Lưu lại
        await post.save();
        res.status(200).json({ message: "Cập nhật thành công!", post });
    } catch (error) {
        console.error("Lỗi khi cập nhật:", error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi cập nhật dữ liệu." });
    }
});

router.delete("/delete/:id", async (req, res) => {
	try {
		await Post.deleteOne({ username: req.body.username })
		res.status(204).send()
	} catch {
		res.status(404)
		res.send({ error: "Post doesn't exist!" })
	}
})

module.exports = router