exports.successResponse = (data, message='') =>{
  return {
    status: 'success',
    data,
    message
  };
}

exports.errorResponse = (message) =>{

  return {
    status:'error',
    message
  };
}


