const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).redirect('/login');
  }
};

module.exports = auth; 