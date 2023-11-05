const { Profile, Job, Contract} = require('../models');
const {successResponse, errorResponse} = require("../utils/apiResponse");
const {sequelize} = require("../database");

exports.depositBalance = async (req, res, next) => {
  const { userId } = req.params;
  const { amount } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const user = await Profile.findOne({ where: { id: userId } });

    if (!user || user.type !== 'client') {
      return res.status(404).json(errorResponse('User not found or not a client'));
    }

    const unpaidJobs = await Job.findAll({
      include: {
        model: Contract,
        where: { ClientId: userId, status: 'in_progress' },
        attributes: []
      },
      where: { paid: false },
      attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'totalAmount']]
    });

    const totalUnpaidAmount = unpaidJobs[0].dataValues.totalAmount || 0;

    if (amount > totalUnpaidAmount * 0.25) {
      return res.status(400).json(errorResponse('Deposit amount exceeds 25% of total unpaid job amount'));
    }

    user.balance += amount;

    await user.save({ transaction });

    await transaction.commit();

    return res.json(successResponse({ balance: user.balance }, 'Deposit successful'));

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
