const express = require('express');
const { Bill, Person, History } = require('../models');
const router = express.Router();

// initialization
router.use(async (req, res, next) => {
  if (!await Bill.countDocuments()) {
    await Bill.create({ bill_amount: 0, deu_amount: 0 });
  }
  next();
});

// GET dashboard
router.get('/dashboard', async (req, res) => {
  const bill = await Bill.findOne();
  const people = await Person.find();
  const history = await History.find();
  res.json({ bill, people, history });
});

// POST shared bill
router.post('/add-shared-bill', async (req, res) => {
  const { amount, date } = req.body;
  const bill = await Bill.findOne();
  const people = await Person.find();
  const share = amount / people.length;
  await Bill.updateOne({}, { $inc: { bill_amount: amount, deu_amount: amount } });
  await Person.updateMany({}, { $inc: { due: share.toFixed(2) } });
  await History.create({ name: 'All', amount, bill_type: `Share-bill (${share.toFixed(2)} * ${people.length})`, date });
  const count = await History.countDocuments();
  if (count > 70) {
    const oldest = await History.findOne().sort({ _id: 1 }); // oldest entry by creation order
    if (oldest) {
      await History.deleteOne({ _id: oldest._id });
    }
  }
  res.sendStatus(200);
});

// POS personal bill
router.post('/add-person-bill', async (req, res) => {
  const { personId, name, amount, date } = req.body;
  const currentPerson = await Person.findById(personId);
  await Person.updateOne({ _id: personId }, { $inc: { due: amount } });
  await Bill.updateOne({}, { $inc: { bill_amount: amount, deu_amount: amount } });
  await History.create({ name, amount, bill_type: `Personal-bill (total: ${(currentPerson.due + amount).toFixed(2)})`, date });
  const count = await History.countDocuments();
  if (count > 70) {
    const oldest = await History.findOne().sort({ _id: 1 }); // oldest entry by creation order
    if (oldest) {
      await History.deleteOne({ _id: oldest._id });
    }
  }
  res.sendStatus(200);
});

// POST payment
router.post('/add-payment', async (req, res) => {
  const { personId, name, amount, date } = req.body;
  const currentPerson = await Person.findById(personId);
  await Person.updateOne({ _id: personId }, { $inc: { due: -amount } });
  await Bill.updateOne({}, { $inc: { bill_amount: -amount, deu_amount: -amount } });
  const currentStatus = currentPerson.due.toFixed(2) > amount.toFixed(2) ? `(Due: ${(currentPerson.due.toFixed(2) - amount.toFixed(2)).toFixed(2)})` : currentPerson.due.toFixed(2) < amount.toFixed(2) ?  `(Savings: ${(amount.toFixed(2) - currentPerson.due.toFixed(2)).toFixed(2)})` : '(All clear)';
  await History.create({ name, amount, bill_type: `Paid ${currentStatus}`, date });
  const count = await History.countDocuments();
  if (count > 70) {
    const oldest = await History.findOne().sort({ _id: 1 }); // oldest entry by creation order
    if (oldest) {
      await History.deleteOne({ _id: oldest._id });
    }
  }
  res.sendStatus(200);
});

// Add Person
router.post('/add-person', async (req, res) => {
  const { name } = req.body;
  if (name) {
    await Person.create({ name, due: 0.0 });
  }
  res.redirect('/');
});

// Remove Person
router.post('/remove-person', async (req, res) => {
  const { person_id } = req.body;
  if (person_id) {
    await Person.findByIdAndDelete(person_id);
  }
  res.redirect('/');
});

// Reset All Data
router.post('/reset-data', async (req, res) => {
  await History.deleteMany({});
  await Person.deleteMany({});
  await Bill.deleteMany({});
  await Bill.create({ bill_amount: 0.0, deu_amount: 0.0 });
  res.redirect('/');
});

module.exports = router;
