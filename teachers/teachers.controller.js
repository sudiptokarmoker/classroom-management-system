const express = require('express');
const router = express.Router();
const authorize = require('_helpers/authorize');
const Role = require('_helpers/role');
const {pool} = require('../db/connection.js');
const transporter = require('./../settings/email');
const bcrypt = require('bcrypt');
const makeid = require('./../_helpers/util');
// routes
router.post('/create', authorize(Role.Admin), create_teacher);     // public route
router.post('/create-classroom', authorize([Role.Teacher, Role.Admin]), create_classroom);     // public route
router.post('/create-assessment', authorize([Role.Teacher, Role.Admin]), create_assessment);
router.get('/classroom-lists', authorize([Role.Teacher, Role.Admin]), classroom_lists);
router.post('/assignment-evaluation', authorize([Role.Teacher, Role.Admin]), assignment_evaluation);
router.get('/classroom-lists', authorize(Role.Teacher), lists_of_classroom);
router.post('/check-file-submitted-lists', authorize(Role.Teacher), check_file_submitted_lists);
router.post('/give-marks', authorize(Role.Teacher), give_marks_to_assessment_submission);
//router.get('/class-assessment-lists', class_assessment_lists);

module.exports = router;

async function create_teacher(req, res, next){
    try {
        const {name, email} = req.body;
        pool.query("SELECT * FROM users WHERE email = ?", [email] , async (err, data, field) => {
            if(err) {
                return res.send({
                    status: false,
                    error: {
                        message: err.message
                    }
                })
            }
            if(data && data.length > 0){
                return res.send({
                    status: false,
                    error: {
                        message: "teacher already exists"
                    }
                })
            }
            // insert into db
            const saltRounds = 10;
            const password = "123456"; // this is temporary password for teacher
            const pass = bcrypt.hashSync(password, saltRounds);
            pool.query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)", [name, email, pass, Role.Teacher, new Date()], async (err, data, fields) => {
                if(err) throw new Error(err);
                /// here send the email to that address
                let emailBody = `<h2>Dear ${name}, Successfully created you as teacher.</h2> 
                    <p>Here is the following your access of login</p>
                    <div>
                        <p>email id : ${email}</p>
                        <p>password : ${password}</p>
                    </div>`;
                let message = {
                    from: process.env['EMAIL_FROM'],
                    to: email,
                    subject: "Teacher created confirmation",
                    html: emailBody
               }
               transporter.sendMail(message, (err, info) => {
                    if (err) {
                      throw new Error(err);
                    }
                    res.json({
                        status: "Successfully created teacher",
                        info: {
                            message: "An email has been sent to this teacher"
                        },
                        data : {
                            email: email,
                            pass: password,
                            role: Role.Teacher
                        }
                    });
               });
            })
        });
    } catch(error){
        throw new Error(error);
    }
}

async function create_classroom(req, res, next){
    const {subject_title} = req.body;
    const created_at_date_time = new Date();
    const random = makeid(6);
    pool.query("INSERT INTO classroom (subject_title, created_at, created_by_id, invite_code) VALUES (?, ?, ?, ?)", [subject_title, created_at_date_time, req.user.sub, random], async (err, data, fields) => {
        if(err) throw new Error(err);
        res.json({
            status: "Successfully created classroom",
            data: {
                subject_title: subject_title,
                created_at: created_at_date_time
            }
        });
    });
}

async function create_assessment(req, res, next){
    try{
        const {class_room_id, assessment_title, type, deadline_of_submission} = req.body;
        if(type === undefined || type === null) {
            return res.json({status: false,
                error: {
                    message: "type required"
                }
            })
        }
        if(type !== 'assignment' && type !== 'exam'){
            return res.json({
                status: false,
                error: {
                    message: "type should be : assignment or exam"
                }
            })
        }
        pool.query('SELECT * FROM classroom WHERE created_by_id = ? AND id = ?', [req.user.sub, class_room_id], async(err, data) => {
            if(err) throw new Error(err);
            if(data && data.length > 0){
                // insert now into subject_assessment table
                const classroom_code = data[0].invite_code;
                pool.query("INSERT INTO subject_assessment (classroom_id, classroom_code, assessment_title, type, deadline_of_submission) VALUES (?, ?, ?, ?, ?)", [class_room_id, classroom_code, assessment_title, type, deadline_of_submission], async (err, data, fields) => {
                    if(err) throw new Error(err);
                    res.json({
                        status: `Successfully created classroom ${type}`
                    });
                });
            } else {
                res.status(403).json({
                    status: "not found"
                });
            }
        });
    } catch(error){
        return res.json({
            status: false,
            error: {
                message: error.message
            }
        });
    }
}
async function classroom_lists(req, res, next){
    try{
        pool.query('SELECT * FROM classroom WHERE created_by_id = ?', [59], async(err, data) => {
            if(err) throw new Error(err);
            if(data && data.length > 0){
                res.json({
                    status: "found",
                    data
                });
            } else {
                res.json({
                    status: "not found"
                });
            }
        });
    } catch(error){
        return res.json({
            status: false,
            error: {
                message: error.message
            }
        });
    }
}

async function lists_of_classroom(req, res, next){
    pool.query("SELECT * FROM classroom WHERE created_by_id = ?", [req.user.sub] , async (err, data, field) => {
        if(data && data.length > 0){
            res.json({
                status: "found",
                data
            });
        } else {
            res.json({
                status: false,
                error: {
                    message: "Not any classroom lists found"
                }
            });
        }
    });
}

async function assignment_evaluation(req, res, next){
    const {class_room_id} = req.body;
    pool.query("SELECT * FROM subject_assessment WHERE classroom_id = ?", [class_room_id] , async (err, data, field) => {
        if(data && data.length > 0){
            res.json({
                status: "found",
                data
            });
        } else {
            res.json({
                status: false,
                error: {
                    message: "Not any assesment lists found"
                }
            });
        }
    });
}

async function check_file_submitted_lists(req, res, next){
    const { assessment_id } = req.body;
    pool.query("SELECT * FROM assessment_evaluation WHERE assessment_id = ?", [assessment_id] , async (err, data, field) => {
        if(data && data.length > 0){
            res.json({
                status: "found",
                data
            });
        } else {
            res.json({
                status: false,
                error: {
                    message: "Not any assesment lists found"
                }
            });
        }
    });
}

async function give_marks_to_assessment_submission(req, res, next){
    const {submission_id, marks} = req.body;
    pool.query("UPDATE assessment_evaluation SET marks = ? WHERE id = ?", [marks, submission_id], async (err, data, fields) => {
        if(err) throw new Error(err);
        res.json({
            status: "Successfully update marks",
            data: {}
        });
    });
}