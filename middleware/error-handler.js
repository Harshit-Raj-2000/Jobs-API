// const { CustomAPIError } = require('../errors')
const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {

  let customError = {
    // set defaults
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg:err.message || 'Something went wrong try again letter'
  }

  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message })
  // }

    if(err.name === 'ValidationError'){
        customError.msg = Object.values(err.errors).map((item) =>item.message).join(',')
        customError.statusCode = 400
    }

    if(err.name === 'CastError'){
        customError.msg = `No item found with id ${err.value}`
        customError.statusCode = 404
    
    }

  // based on err.code, we will change the response 11000 error, is for if email already exists in register route
  if(err.code && err.code === 11000){
    customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please chose another value`
    customError.statusCode = 400
  }



  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
  return res.status(customError.statusCode).json({ msg:customError.msg })

}

module.exports = errorHandlerMiddleware
