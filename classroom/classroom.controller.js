const express = require('express');
const router = express.Router();
const {pool} = require('../db/connection.js');
const makeid = require('../_helpers/util');
router.post('/class-assessment-lists', class_assessment_lists);
router.get('/classroom-lists', class_room_lists);

module.exports = router;


async function class_room_lists(req, res, next){
    try{
        pool.query('SELECT subject_title, invite_code AS class_code, created_at FROM classroom ORDER BY id DESC', async(err, data) => {
            if(data && data.length > 0){
                res.json({
                    status: "found classroom lists",
                    data
                });
            } else {
                return res.json({
                    status: false,
                    error: {
                        message: "sorry, not any classfound on this invite code"
                    }
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

async function class_assessment_lists(req, res, next){
    try{
        const {invite_code} = req.body;
        if(invite_code === undefined || invite_code === null) return res.json({status: false, message: "required invide code"});
        // here first have to find the classroom_id from invite code
        pool.query('SELECT * FROM classroom WHERE invite_code = ?', [invite_code], async(err, data) => {
            if(data && data.length > 0){
                const classRoomId = data[0].id;
                pool.query('SELECT * FROM subject_assessment WHERE classroom_id = ?', [classRoomId], async(err, data) => {
                    if(err) throw new Error(err);
                    if(data && data.length > 0){
                        res.json({
                            status: "found",
                            data
                        });
                    } else {
                        res.json({
                            status: false,
                            message: "not any assessment found"
                        });
                    }
                });
            } else {
                return res.json({
                    status: false,
                    error: {
                        message: "sorry, not any classfound on this invite code"
                    }
                });
            }
        });
        //return res.json({});; // this  formate getting error here
    } catch(error){
        return res.json({
            status: false,
            error: {
                message: error.message
            }
        });
    }
}