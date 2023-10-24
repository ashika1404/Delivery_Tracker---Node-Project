function checkPermissions(requiredPermissions) {
    return (req, res, next) => {
        console.log(requiredPermissions)
        console.log([req.userType])
        const userRole = req.userType;
        if (requiredPermissions.includes(userRole)) {
            return next();
        } else {
            return res.status(403).json({ error: 'Permission denied' });
        }
    };
}

module.exports = checkPermissions;
