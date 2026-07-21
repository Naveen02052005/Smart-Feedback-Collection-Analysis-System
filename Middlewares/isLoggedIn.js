module.exports.isLoggedIn=((req, res, next)=> {
  if (!req.session.userId) {
    req.session.redirectUrl = req.originalUrl;
    return res.redirect("/login");
  } 
  next();
});


module.exports.isAdminLogged = ((req, res, next) => {
    if (!req.session.adminId) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/admin/login");
    } 
    next();
});