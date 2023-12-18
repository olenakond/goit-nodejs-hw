const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

const dotenv = require("dotenv");
dotenv.config();

const { ctrlWrapper, HttpError } = require("../helpers");
const User = require("../models/users");

const { SECRET_KEY } = process.env;

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  const user = await User.findOne({ _id });
  if (!user) {
    throw HttpError(401, "Not authorized");
  }

  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json();
};

const changeSubscription = async (req, res) => {
  const { _id, subscription: currentSubscription } = req.user;
  const { subscription: querySubscription } = req.body;

  if (currentSubscription === querySubscription) {
    throw HttpError(
      400,
      `subscription "${querySubscription}" is already in use`
    );
  }
  const { email, subscription } = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });

  res.status(200).json({ email, subscription });
};

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;

  if (!req.file) {
    throw HttpError(400, "File not added");
  }

  const { path: tmpUpload, originalname } = req.file;

  try {
    const avatar = await Jimp.read(tmpUpload);
    avatar.resize(250, 250).write(tmpUpload);
  } catch (error) {
    next(error);
  }

  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarDir, filename);
  await fs.rename(tmpUpload, resultUpload);

  const avatarURL = path.join("avatar", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({
    avatarURL,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  changeSubscription: ctrlWrapper(changeSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
