const Profile = require("../models/Profile");
const {errorResponse} = require("../utils/apiResponse");

const getProfile = async (req, res, next) => {
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
    if(!profile) return res.status(401).json(errorResponse('profile not found')).end();
    req.profile = profile
    next()
}
module.exports = {getProfile}