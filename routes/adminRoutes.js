const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const {isAdminLogged} = require('../Middlewares/isLoggedIn');

router.get("/login", adminController.getAdminLogin);
router.post("/login", adminController.postAdminLogin);
router.get("/adminLogin", adminController.getAdminLogin);

router.get("/",isAdminLogged, adminController.getAdminDashboard);

router.get("/users", adminController.getAllUsers);
router.get("/users/:id/edit", adminController.getEditUser);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

router.get("/feedbacks", adminController.getAllFeedbacks);
router.delete("/feedbacks/:id", adminController.deleteFeedback);



module.exports = router;
