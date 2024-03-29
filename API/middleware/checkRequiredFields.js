// errorHandler.js

const checkRequiredFields = (requiredFields) => {
    return (req, res, next) => {
      const requestData = req.body;
  
      for (const field of requiredFields) {
        if (!requestData[field]) {
          return res.status(400).json({ error: `${field} field is mandatory.` });
        }
      }
      next();
    };
  };
  
  export default checkRequiredFields;
  