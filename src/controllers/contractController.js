const Contract = require('../models/Contract');
const {Op} = require("sequelize");
const {successResponse, errorResponse} = require("../utils/apiResponse");
const {Profile} = require("../models");


exports.getContract = async (req, res, next) => {
    try {
        const contract = await Contract.findOne({
            where: {
                id: req.params.id,
                [Op.or]: [{ ContractorId: req.profile.id }, { ClientId: req.profile.id }]
            },
            attributes: {
                exclude: ['ContractorId', 'ClientId']
            },
            include: [
                { model: Profile, as: 'Contractor', attributes: ['id', 'firstName', 'lastName', 'type'] },
                { model: Profile, as: 'Client', attributes: ['id', 'firstName', 'lastName', 'type'] }
            ]
        });
        if (!contract) return res.status(404).json(errorResponse('Contract not found'));
        res.json(successResponse(contract, 'Contract retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getContracts = async (req, res, next) => {
    try {
        const contracts = await Contract.findAll({
            where: {
                [Op.or]: [{ ContractorId: req.profile.id }, { ClientId: req.profile.id }],
                status: { [Op.ne]: 'terminated' }
            },
            attributes: {
                exclude: ['ContractorId', 'ClientId']
            },
            include: [
                { model: Profile, as: 'Contractor', attributes: ['id', 'firstName', 'lastName', 'type'] },
                { model: Profile, as: 'Client', attributes: ['id', 'firstName', 'lastName', 'type'] }
            ]
        });
        res.json(successResponse(contracts));
    } catch (error) {
        next(error);
    }
};
