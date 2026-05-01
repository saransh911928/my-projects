// This is enhanced code for better error handling and password migration by Copilot

// const router = require("express").Router();
// const User = require("../models/User");
// const CryptoJS = require("crypto-js");
// const jwt = require("jsonwebtoken");

// // REGISTER
// router.post("/register", async (req, res) => {
//     if (!process.env.SECRET_KEY) {
//       return res.status(500).json({ message: 'Server misconfiguration: SECRET_KEY not set. Add SECRET_KEY to your .env and restart the server.' });
//     }

//     const newUser = new User({
//         username: req.body.username,
//         email: req.body.email,
//         password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
//     });

//     try {
//     const user = await newUser.save();
//     const { password, ...info } = user._doc; // exclude password from response
//     res.status(201).json(info);
//     } catch (err) {
//     if (err.code === 11000) {
//       const field = Object.keys(err.keyPattern || err.keyValue || { unknown: 1 })[0];
//       return res.status(400).json({ message: `${field} already exists` });
//     }
//     res.status(500).json(err);
//     }
// });   

// // LOGIN
// router.post("/login", async (req, res) => {
//     try {
//     if (!process.env.SECRET_KEY) {
//       return res.status(500).json({ message: 'Server misconfiguration: SECRET_KEY not set. Add SECRET_KEY to your .env and restart the server.' });
//     }

//     const user = await User.findOne({ email: req.body.email });
//     if (!user) return res.status(401).json("Wrong credentials!");

//     // Attempt to decrypt stored password (if stored encrypted)
//     let originalPassword = "";
//     try {
//       const bytes  = CryptoJS.AES.decrypt(user.password || "", process.env.SECRET_KEY);
//       originalPassword = bytes.toString(CryptoJS.enc.Utf8);
//     } catch (e) {
//       originalPassword = "";
//     }

//     let passwordMatch = originalPassword === req.body.password;

//     // Fallback: if the stored password is plaintext and matches, migrate to encrypted
//     if (!passwordMatch && user.password === req.body.password) {
//       // migrate to encrypted storage
//       user.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString();
//       await user.save();
//       passwordMatch = true;
//     }

//     if (!passwordMatch) return res.status(401).json("Wrong credentials!");

//     const accessToken = jwt.sign(
//         { id: user._id, isAdmin: user.isAdmin },
//         process.env.SECRET_KEY,
//         { expiresIn: "5d" }
//     );

//     const { password, ...info } = user._doc; // to exclude password from response

//     res.status(200).json({ ...info, accessToken });
//     } catch (err) {
//     res.status(500).json(err);
//     }
// });
    


// module.exports = router; 



const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
  });
  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json("Wrong password or username!");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json("Wrong password or username!");
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );

    const { password, ...info } = user._doc;

    res.status(200).json({ ...info, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
