function allowedUserType(req, res, next) {
    const requestingUserRole = req.userType;
    console.log(requestingUserRole)
    let allowedUserTypes = [];
    if (requestingUserRole === 'admin') {
        allowedUserTypes = ['admin', 'manager', 'delivery boy'];
    } else if (requestingUserRole === 'manager') {
        allowedUserTypes = ['delivery boy', 'manager'];
    }
    else {
        return res.status(403).json({ error: 'Unauthorized user' });
    }
    if (allowedUserTypes.includes(requestingUserRole)) {
        next();
    } else {
        return res.status(400).json({ error: 'Invalid user type for the requesting user' });
    }
}
module.exports = allowedUserType