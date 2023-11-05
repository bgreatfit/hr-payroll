const {Op} = require('sequelize');
const {Contract, Job, Profile} = require("../models");
const {sequelize} = require("../database");
const {successResponse, errorResponse} = require("../utils/apiResponse");

exports.getUnpaidJobs = async (req, res, next) => {
    try {
        const unpaidJobs = await Job.findAll({
            include: [{
                model: Contract,
                where: {
                    status: 'in_progress',
                    [Op.or]: [{ContractorId: req.profile.id}, {ClientId: req.profile.id}]
                },
                include: [
                { model: Profile, as: 'Contractor', attributes: ['id', 'firstName', 'lastName', 'type'] },
                { model: Profile, as: 'Client', attributes: ['id', 'firstName', 'lastName', 'type'] }
            ]
            }],
            where: {
                paid: false
            }
        });
        res.json(successResponse( unpaidJobs));
    } catch (error) {
         next(error);
    }

};
exports.payForJob = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const job = await Job.findOne({
            where: {id: req.params.job_id},
            include: {
                model: Contract,
                include: [
                    {model: Profile, as: 'Client'},
                    {model: Profile, as: 'Contractor'}
                ]
            }
        });

        if (!job) {
            return res.status(404).json(errorResponse( 'Job not found'));
        }


        const client = job.Contract.Client;
        const contractor = job.Contract.Contractor;

        if (client.balance < job.price) {
            return res.status(400).json(errorResponse( 'Insufficient funds'));
        }

        client.balance -= job.price;
        contractor.balance += job.price;
        job.paid = true;
        job.paymentDate = new Date();

        await Promise.all([
            client.save({transaction}),
            contractor.save({transaction}),
            job.save({transaction})
        ]);

        await transaction.commit();

        res.status(200).json(successResponse(null, 'Payment successful'));
    } catch (error) {
        await transaction.rollback();
         next(error);
    }
};