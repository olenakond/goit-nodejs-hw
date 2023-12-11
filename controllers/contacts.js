const { HttpError, ctrlWrapper } = require("../helpers");

const Contact = require("../models/contact");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;

  const skip = (page - 1) * limit;

  const queryResult = Contact.find({ owner }, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email");
  const queryCount = Contact.countDocuments({ owner });

  if (favorite) {
    queryResult.where("favorite").equals(favorite);
    queryCount.where("favorite").equals(favorite);
  }

  const result = await queryResult.exec();
  const count = await queryCount.exec();

  res.status(200).json({
    data: result,
    page: page.toString(),
    limit: limit.toString(),
    count: count.toString(),
  });
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;
  const result = await Contact.findById(contactId);

  if (!result || userId.toString() !== result.owner.toString()) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

const removeContact = async (req, res) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;
  const result = await Contact.findByIdAndDelete(contactId);

  if (!result || userId.toString() !== result.owner.toString()) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "contact deleted" });
};

const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;

  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "missing fields");
  }
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });

  if (!result || userId.toString() !== result.owner.toString()) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
};

const updateStatusContact = async (req, res) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;

  if (Object.keys(req.body).length === 0) {
    throw HttpError(400, "missing field favorite");
  }
  const result = await Contact.findByIdAndUpdate(contactId, req.body, {
    new: true,
  });
  
  if (!result || userId.toString() !== result.owner.toString()) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  removeContact: ctrlWrapper(removeContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
