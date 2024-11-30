const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

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


exports.updatePassword = async (user, oldPassword, newPassword) => {
    try {
      // Compare the provided old password with the stored hashed password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return { success: false, message: 'Old password is incorrect' };
      }
  
      // Hash and update the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("hashed password is : " + hashedPassword);
      user.password = hashedPassword;
      console.log("user password is : " + user.password);
      await user.save();
  
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'An error occurred while updating the password' };
    }
  };