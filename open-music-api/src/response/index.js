module.exports = {
  successResponse(data, responseMessage) {
    return {
      status: 'success',
      message: responseMessage,
      data,
    };
  },

  finalResponse(response, reply) {
    let finalResponse = response;
    if (response instanceof Error) {
      finalResponse = reply.response({
        status: 'fail',
        error: response.output.payload.error,
        message: response.message,
      });

      if (response.statusCode) finalResponse.code(response.statusCode);
      else finalResponse.code(response.output.payload.statusCode);

      return finalResponse;
    }

    return finalResponse;
  },
};
