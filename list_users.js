const mongoose = require('mongoose');
require('./schemas/users');
mongoose.connect('mongodb://localhost:27017/NNPTUD-S3').then(async () => {
    const users = await mongoose.model('user').find({}, {_id: 1, username: 1}).limit(10);
    console.log("DANH SACH USER ID:");
    users.forEach(u => console.log(`${u.username}: ${u._id}`));
    process.exit();
});
