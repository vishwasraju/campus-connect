const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: `"Namma Voice" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Login OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`
  });
};

module.exports = sendOtpMail;
