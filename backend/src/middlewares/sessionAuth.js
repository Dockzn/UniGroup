const session = require('express-session');

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'unigroup_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
});

function sessionAuth(req, res, next) {
    if (
        req.path === '/login' ||
        req.path === '/cadastro' ||
        req.path === '/index' ||
        req.path.startsWith('/api/auth/login') ||
        req.path.startsWith('/api/auth/register')
    ) {
        return next();
    }
    if (req.session && req.session.user) {
        return next();
    }
    return res.redirect('/login');
}

module.exports = { sessionMiddleware, sessionAuth };
