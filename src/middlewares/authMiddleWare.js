const {ValidationError,AuthenticationError,NotFoundError}= require("../utils/errors")
const {verufyAuth}= require("../utils/authClient")

const verifyAuthentication = async(req,res,next)=>{


try{
    
    const token = req.cookies.token
    if(!token){
       throw   new NotFoundError("invalid Token")
    }

    const authResponse = await verufyAuth(token)
    if(!authResponse ||!authResponse.authenticated){
       throw new AuthenticationError(authResponse?.message || "invalid token")
    }
    req.userId=authResponse.userId
    next()

}catch(err){
next(err)
}

}

module.exports = { verifyAuthentication}