const moment = require('moment');
const {Job, Profile, Contract} = require('../models');
const {successResponse, errorResponse} = require("../utils/apiResponse");
const {sequelize, Sequelize} = require("../database");


exports.getBestProfession = async (req, res, next) => {
    let { start, end } = req.query;
    if (!start || !end) {
        return res.status(400).json(errorResponse('Both start and end dates are required'));
    }
    start = moment(start, "YYYY-MM-DD").format("YYYY-MM-DD");
    end = moment(end, "YYYY-MM-DD").format("YYYY-MM-DD");


    try {
        const result = await Job.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('price')), 'totalEarnings'],
                [sequelize.col('Contract.Contractor.profession'), 'profession']
            ],
            include: [{
                model: Contract,
                attributes: [],
                include: [{
                    model: Profile,
                    as: 'Contractor',
                    attributes: []
                }]
            }],
            where: {
                paymentDate: {
                    [Sequelize.Op.between]: [start, end]
                },
                paid: true
            },
            group: ['Contract.Contractor.profession'],
            order: sequelize.literal('totalEarnings DESC'),
            limit: 1
        });

        if (result.length > 0) {
            return res.json(successResponse(result[0].get(), 'Query successful'));
        } else {
            return res.json(successResponse('No data found for the specified date range'));
        }

    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.getBestClients = async (req, res, next) => {
    let {start, end, limit = 2} = req.query;
    if (!start || !end) {
        return res.status(400).json(errorResponse('Both start and end dates are required'));
    }

    start = moment(start, "YYYY-MM-DD").format("YYYY-MM-DD");
    end = moment(end, "YYYY-MM-DD").format("YYYY-MM-DD");


    try {
        const result = await Job.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('price')), 'totalSpent'],
                [sequelize.col('Contract.Client.id'), 'clientId'],
                [sequelize.col('Contract.Client.firstName'), 'clientFirstName'],
                [sequelize.col('Contract.Client.lastName'), 'clientLastName']
            ],
            include: [{
                model: Contract,
                attributes: [],
                include: [{
                    model: Profile,
                    as: 'Client',
                    attributes: []
                }]
            }],
            where: {
                paymentDate: {
                    [Sequelize.Op.between]: [start, end]
                },
                paid: true
            },
            group: [sequelize.col('Contract.Client.id')],
            order: sequelize.literal('totalSpent DESC'),
            limit: parseInt(limit, 10)
        });

        if (result.length > 0) {
            return res.json(successResponse(result, 'Query successful'));
        } else {
            return res.json(successResponse(null, 'No data found for the specified date range'));
        }

    } catch (error) {
        console.error(error);
        next(error);
    }
};
