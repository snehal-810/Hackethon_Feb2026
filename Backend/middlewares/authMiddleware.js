// // to be implemented.

// const config = require("../config")
// const { errorResponse } = require("../utils/apiResponse");


// function authorization(request, response, next) {

//     if(request.url == '/user/login' || '/user/register' || '/course/all-active-courses') next()
//         else {
//     const token = request.headers.token
//     if (token) {
//         try {
//             const payload = jwt.verify(token, config.JWT_SECRET_KEY)
//             request.headers.userId = payload.userId
//             request.userId = payload.userId
//             next()
//         } catch (e) {
//             response.send(errorResponse('invalid Token'))
//         }
//     }         else response.send(errorResponse('Token is Missing'))

// }
// }

// module.exports = authorization


const jwt = require("jsonwebtoken");
const config = require("../config");
const { errorResponse } = require("../utils/apiResponse");

function authorization(req, res, next) {

    // Routes allowed without token
    const publicRoutes = [
        "/user/login",
        "/user/register",
        "/course/all-active-courses"
    ];

    if (publicRoutes.includes(req.originalUrl)) {
        return next();
    }

    const token = req.headers.token;

    if (!token) {
        return res.send(errorResponse("Token is Missing"));
    }

    try {
        const payload = jwt.verify(token, config.JWT_SECRET_KEY);

        // Store user info in request
        req.user = {
            email: payload.email,
            role: payload.role
        };

        return next();
        
    } catch (error) {
        return res.send(errorResponse("Invalid Token"));
    }
}

// Optional – for admin-only routes
function checkAuthorization(request, response, next) {
    if (request.user && request.user.role === "admin") {
        return next();
    }
    return response.send(errorResponse("Unauthorized Access Admin Only"));
}

module.exports = { authorization, checkAuthorization };
