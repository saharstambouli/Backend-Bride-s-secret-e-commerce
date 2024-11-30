const userService = require("../services/userService")
const authService = require("../services/authService")
const jwtService = require("jsonwebtoken");
const uuivd = require("uuid");
const mailer = require("../NodeMailer/transporter")

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (! await userService.checkUserExists(email)) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const id = await authService.login(email, password);
        if (!id) {
            return res.status(401).json({ message: "Check your password" });
        }
        const token = jwtService.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "8h" });
        return res.status(200).json({ token })

    }
    catch (error) {
        console.log("controller error " + error);
    }
}

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (! await userService.checkUserExists(email)) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const code = uuivd.v4();
        await userService.updateUser(email, "code", code);
        const tokenForgetPassword = jwtService.sign({code}, process.env.JWT_RESET_KEY,{expiresIn:"4h"});
        await mailer.sendEmail(email, tokenForgetPassword);
        console.log("token is : " + tokenForgetPassword);
        return res.status(201).json({message:"Check your email"});
    }
    catch (error) {
        console.log("controller error: " + error);
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const {newPassword} = req.body;
        const codeForgetPassword = req.codeForgetPassword;
        if (await authService.matchPassword(newPassword,codeForgetPassword))
            return res.status(409).json({message:"New password can't be the same as the old password"});    
        const passwordChanged = await authService.changePassword(codeForgetPassword, newPassword);
        if (!passwordChanged)
            return res.status(400).json({ message: "Change Password Failed" });
        return res.status(201).json({ message: 'Password changed Successfully' });
    }
    catch (error) {
        console.log("controller error : " + error);
    }
}


exports.updatePassword = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      const { oldPassword, newPassword } = req.body;
      const user = req.user;
  
      const result = await authService.updatePassword(user, oldPassword, newPassword);
  
      if (result.success) {
        return res.status(200).json({ message: 'Password updated successfully' });
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };