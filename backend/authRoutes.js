const express = require("express");

const jwt = require("jsonwebtoken");
const {z} = require("zod");
const User = require("./user");
const Admin = require("./admin");
const sendOtpMail = require("./mailer");

const router = express.Router();

const userSchema = z.object({
    studentID: z.string().length(10)
});

const otpSchema = z.object({
    studentID: z.string().length(10),
    otp: z.string().length(6)
});

const signupOtpSchema = z.object({
    studentID: z.string().length(10),
    otp: z.string().length(6),
    email: z.email()
})

const signupSchema = z.object({
    studentID: z.string().length(10),
    name: z.string(),
    phone: z.string().length(10),
    email: z.email()
})

const adminLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
});

router.post("/admin-login", async (req, res) => {

    const {success, data} = adminLoginSchema.safeParse(req.body);

    console.log(data);

    if(!success){
        res.status(400).json({message: "Invalid format"});
        return;
    }

    const adminDB = await Admin.findOne({ email: data.email });
    console.log(adminDB.email, adminDB.password);

    if(!adminDB){
        res.status(401).json({message: "Unauthorized: Invalid email or password"});
        return;
    }

    if(data.password !== adminDB.password){
        res.status(401).json({message: "Unauthorized: Invalid email or password"});
        return;
    }

    const token = jwt.sign({
        userId: adminDB._id,
        role: 'admin',
        email: adminDB.email,
    }, process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );

    res.status(200).json({token});


});

router.post("/login", async (req, res) => {

    const {success, data} = userSchema.safeParse(req.body);
    if(!success){
        return res.status(401).json({message: "Invalid format"});
    }
    const user = await User.findOne({studentID : data.studentID})
    if(!user){
        return res.status(401).json({message: "Invalid credentials"});
    }

    const otp = "456456";   // or now hardcoded
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendOtpMail(user.email, otp);

    res.json({ message: "OTP sent to registered email" });

});

router.post("/login/verify-otp", async (req, res) => {
    const {success, data} = otpSchema.safeParse(req.body);
    if(!success){
        return res.status(401).json({message: "Invalid"});
    }
    const user = await User.findOne({studentID: data.studentID});
    if(!user || !user.otp){
        return res.status(401).json({ message: "Invalid request" });
    }
    if(user.otpExpiresAt < Date.now()){
        return res.status(401).json({ message: "OTP expired" });
    }
    if(user.otp !== data.otp){
        return res.status(401).json({ message: "Invalid OTP" });
    }
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Name: ", user.name, "Token: ", token);

    res.status(200).json({
      token,
      role: user.role,
      studentID: user.studentID,
      name: user.name
    });

});

router.post("/signup", async (req, res) => {

    try{

    const {success, data} = signupSchema.safeParse(req.body);

    if(!success){
        return res.status(400).json({message: "Ivalid format of data"})
    }

    const userAlreadyExist = await User.findOne({email: data.email});

    if(userAlreadyExist){
        return res.status(400).json({message: "An account may already exist with these details."})
    }

    const otp = "456456"    // For time being hardcoded
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;

    const user = new User({
        name: data.name,
        studentID: data.studentID,
        email: data.email,
        phone: data.phone,
        role: 'student',
        otp: otp,
        otpExpiresAt: otpExpiresAt,
        createdAt: Date.now()
    });

    await user.save();
    res.status(201).json({message: "User Create Successfully"});

    await sendOtpMail(data.email, otp);

    } catch(err){
        res.status(500).json({message: err.message})
    }

});

router.post("/signup/verify-otp", async (req, res) => {
    try{

        const {success, data} = signupOtpSchema.safeParse(req.body);

        if(!success){
            return res.status(400).json({message: "Invalid format of data"})
        }

        const user = await User.findOne({email: data.email});

        if(!user || !user.otp){
            return res.status(401).json({message: "Invalid Request"});
        }

        if(user.otpExpiresAt < Date.now()){
            return res.status(401).json({message: "OTP Expired"});
        }

        if(user.otp !== data.otp){
            return res.status(401).json({message: "Invalid OTP"});
        }
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        res.status(201).json({message: "OTP verified successully"})

    }catch(err){
        res.status(500).json({message: err.message});
    }
});

module.exports = router;