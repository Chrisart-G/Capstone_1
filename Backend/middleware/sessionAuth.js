// middleware/auth.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }
}
module.exports = isAuthenticated;
