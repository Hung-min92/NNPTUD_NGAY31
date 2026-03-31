const mongoose = require('mongoose');
const userModel = require('./schemas/users');

mongoose.connect('mongodb://localhost:27017/NNPTUD-S3').then(async () => {
    console.log("Đang mở khóa user01...");
    // Tìm user01 và xóa lockTime, status = true, reset password về 123
    await userModel.findOneAndUpdate(
        { username: "user01" },
        { 
            lockTime: new Date(0), // Đưa thời gian khóa về quá khứ
            status: true,
            password: "123" // Đặt lại mật khẩu là 123
        }
    );
    console.log("Đã mở khóa và đặt mật khẩu thành '123' thành công!");
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit();
});
