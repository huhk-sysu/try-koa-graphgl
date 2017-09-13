const { formatError } = require('graphql');

module.exports = error => {
  const data = formatError(error);
  const { originalError } = error;
  if (originalError) {
    delete data.locations;
    data.field = originalError.field;
    data.hint =  originalError.hint;
  }
  return data;
};
