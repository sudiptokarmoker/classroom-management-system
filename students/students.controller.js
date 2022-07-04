const express = require('express');
const router = express.Router();
const authorize = require('_helpers/authorize');
const Role = require('_helpers/role');
const {pool} = require('../db/connection.js');
const transporter = require('../settings/email');
const bcrypt = require('bcrypt');
const makeid = require('../_helpers/util');
// routes
router.post('/enrolment', students_enroll_in_class);     // public route
router.post('/get-class-assessment-lists', authorize([Role.Student, Role.Admin]), getClassAssessMentLists);
router.post('/submit-assessment', authorize(Role.Student), submitAssessmentOfClass);
router.post('/assessment-marks-data', authorize(Role.Student), assessment_marks_data);

module.exports = router;

async function submitAssessmentOfClass(req, res, next){
    try{
        const {classroom_code, subject_assessment_id, file_info} = req.body;
        if(classroom_code === undefined || subject_assessment_id === undefined) return res.json({status: false, error: {message: "requred classroom code and subject_assessment_id"}});
        pool.query('SELECT student_school_id FROM student_details WHERE student_id = ?', [req.user.sub], async(err, data) => {
            if(data && data.length > 0){
                pool.query('SELECT * FROM student_enrollment WHERE student_school_id = ? AND classroom_code = ?', [data[0].student_school_id, classroom_code], async(err, data) => {
                    if(data && data.length > 0){
                        let student_school_id = data[0].student_school_id;
                        // getting here subject assessment id
                        pool.query('SELECT id, deadline_of_submission FROM subject_assessment WHERE id = ?', [subject_assessment_id], async(err, data) => {
                            if(data && data.length > 0){
                                const submission_deadline = data[0].deadline_of_submission;
                                console.log(submission_deadline);
                                let currentDate = new Date(); //Year, Month, Date    
                                if (submission_deadline > currentDate) {    
                                    pool.query("INSERT INTO assessment_evaluation (assessment_id, student_school_id, file_info, submitted_date) VALUES (?, ?, ?, ?)", [subject_assessment_id, student_school_id, file_info, new Date()], async(err, data) => {
                                        return res.json({
                                            status: true,
                                            data: "Assessment Submitted"
                                        })
                                    });
                                } else {    
                                    return res.json({
                                        status: false,
                                        error: {
                                            message: "Assessment period over. We will not take any assessment now"
                                        }
                                    })
                                } 
                            } else {
                                return res.json({
                                    status: false,
                                    error: {
                                        message: "request not valid"
                                    }
                                })
                            }
                        });
                    } else {
                        return res.json({
                            status: false,
                            error: {
                                message: "request not valid"
                            }
                        });
                    }
                });
            } else {
                return res.json({
                    status: false,
                    error: {
                        message: "request not valid"
                    }
                })
            }
        });
    } catch(error){
        return res.json({
            status: false,
            error: {
                message: error.message
            }
        })
    }
    // let sql = "SELECT subject_assessment.id AS subject_assessment_id, subject_assessment.classroom_code AS assessment_classroom_code, subject_assessment.deadline_of_submission FROM subject_assessment JOIN student_enrollment ON student_enrollment.classroom_code = subject_assessment.classroom_code";
    // pool.query(sql, async function (err, result) {
    //     if (err) throw err;
    //     console.log(result);
    // });

    // pool.query("SELECT * FROM subject_assessment WHERE classroom_code = ?", [classroom_code] , async (err, data, field) => {
    //     if(data && data.length > 0){

    //     }
    // });
}

async function getClassAssessMentLists(req, res, next){
    try{
        const {classroom_code} = req.body;
        if(classroom_code === undefined) return res.json({status: false, error: {message: "classroom code required"}});
        pool.query("SELECT * FROM student_details WHERE student_id = ?", [req.user.sub] , async (err, data, field) => {
            if(data && data.length > 0){
                // student_school_id
                // { id: 2, student_id: 68, student_school_id: '4045441' }
                pool.query("SELECT * FROM student_enrollment WHERE student_school_id = ? AND classroom_code = ?", [data[0].student_school_id, classroom_code] , async (err, data, field) => {
                    if(data && data.length > 0){
                        pool.query("SELECT * FROM student_enrollment WHERE student_school_id = ? AND classroom_code = ?", [data[0].student_school_id, classroom_code] , async (err, data, field) => {
                            if(err) throw new Error(err);
                            pool.query("SELECT * FROM subject_assessment WHERE classroom_code = ?", [classroom_code] , async (err, data, field) => {
                                if(err) throw new Error(err);
                                return res.json({
                                    status: true,
                                    data
                                })
                            });
                        });
                    } else {
                        return res.json({
                            status: false,
                            error: {
                                message: "Sorry you are not elible to view this class content"
                            }
                        })
                    }
                });
            } else {
                return res.json({
                    status: false,
                    error: {
                        message: "Student information not valid"
                    }
                })
            }
        });
    } catch(error){
        throw new Error(error);
    }
}

async function students_enroll_in_class(req, res, next){
    try {
        const {classroom_code, name, email, school_id, password} = req.body;
        if(classroom_code === undefined || name === undefined || email === undefined || school_id === undefined || password === undefined){
            return res.json({
                status: false,
                error: {
                    message: "required classroom code, email, password, school_id"
                }
            })
        }
        // now need to check if this user (student) is new
        // if new then create a new user
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
                // now need to check if this user is already enroll or not
                pool.query("SELECT * FROM student_enrollment WHERE student_school_id = ? AND classroom_code = ?", [school_id, classroom_code] , async (err, data, field) => {
                    console.log(data);
                    if(data && data.length > 0){
                        return res.json({
                            status: false,
                            error: {
                                message: "This students already enrolled into this class"
                            }
                        })
                    } else {
                        pool.query("INSERT INTO student_enrollment (student_school_id, classroom_code, joined_date) VALUES (?, ?, ?)", [school_id, classroom_code, new Date()], async(err, data) => {
                            return res.json({
                                status: true,
                                data: {
                                    message: "This students enrolled into this class successfully"
                                }
                            })
                        });
                    }
                })
            } else {
                // insert into db
                const saltRounds = 10;
                const pass = bcrypt.hashSync(password, saltRounds);
                pool.query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)", [name, email, pass, Role.Student, new Date()], async (err, data, fields) => {
                    console.log(data.insertId);
                    if(err) throw new Error(err);
                    // just insert data into students details
                    pool.query("INSERT INTO student_details (student_id, student_school_id) VALUES (?, ?)", [data.insertId, school_id]);
                    // now enroll this student into this class
                    pool.query("INSERT INTO student_enrollment (student_school_id, classroom_code, joined_date) VALUES (?, ?, ?)", [school_id, classroom_code, new Date()]);
                    /// here send the email to that address
                    let emailBody = `<h2>Dear ${name}, Successfully created you as an student.</h2> 
                        <p>Here is the following your access of login</p>
                        <div>
                            <p>email id : ${email}</p>
                            <p>password : ${password}</p>
                        </div>`;
                    let message = {
                        from: process.env['EMAIL_FROM'],
                        to: email,
                        subject: "Student created confirmation",
                        html: emailBody
                }
                transporter.sendMail(message, (err, info) => {
                    if (err) {
                    throw new Error(err);
                    }
                    res.json({
                        status: "Successfully created student",
                        info: {
                            message: "An email has been sent to this student"
                        },
                        data : {
                            email: email,
                            pass: password,
                            role: Role.Teacher
                        }
                    });
                });
                });
            }
        });
    } catch(error){
        throw new Error(error);
    }
}

async function assessment_marks_data(req, res, next){
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