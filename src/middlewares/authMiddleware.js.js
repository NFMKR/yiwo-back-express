// src/middlewares/authMiddleware.js

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });
    
    // 验证 token 的逻辑
    next();
  };