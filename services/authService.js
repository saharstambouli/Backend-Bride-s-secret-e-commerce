const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

exports.login = async (email, password) => {
    try {
        const user = await userModel.findOne({ email });
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(passwordMatch)
        return (passwordMatch ? user._id : null);
    }
    catch (error) {
        console.log(error);
    }
}



exports.changePassword = async (code, newPassword) => {
    try {
        const user = await userModel.findOne({ code })
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.code = null;
        await user.save()
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}

exports.matchPassword = async (newP, code) => {
    try {
        const user = await userModel.findOne({ code });
        return await bcrypt.compare(newP, user.password);
    } catch (error) {
        console.log(error);

    }
}