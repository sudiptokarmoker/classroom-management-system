# classroom-management-system
This is classroom management tasks assignment of Strativ

to install this : 

1. git clone https://github.com/sudiptokarmoker/classroom-management-system.git classroom-management-system
2. go to that directory "classroom-management-system" 
3. upload this attachemnt db to your local mysql sever
4. setup connection at classroom-management-system->db->connection.js
5. setup email configuariton at classroom-management-system->settings->email.js
6. run this command : npm install
7. run command : npm start
and then done............... !


here is the api end point collection url for postman : 
https://www.getpostman.com/collections/ef38d3f9d140eae4716d



API ROUTES: 

signup url as admin : http://127.0.0.1:4000/users/signup-admin
<code>
param: {
    name: VARCHAR
    password: VARCHAR
    email: VARCHAR
}
</code>
type: POST


login : http://127.0.0.1:4000/users/login
param: {
    password: VARCHAR
    email: VARCHAR
}
type: POST

verify : http://127.0.0.1:4000/users/token
header:{
Authorization: Bearer token_string
} 
type: POST

create teacher : http://127.0.0.1:4000/teachers/create
param: {
    name: VARCHAR
    email: VARCHAR
}
type: POST
(for teacher login temporay password: 123456)


create classroom : http://127.0.0.1:4000/teachers/create-classroom
param: {
    subject_title: VARCHAR
}
type: POST


create classroom assessment : http://127.0.0.1:4000/teachers/create-assessment
param: {
    class_room_id: int
    assessment_title: VARCHAR
    type : assignment | exam
    deadline_of_submission : DATE (2021-07-04)
}
type: POST

get classroom assessment lists : http://127.0.0.1:4000/teachers/classroom-lists
header:{
Authorization: Bearer token_string
} 

get classroom assessment : http://127.0.0.1:4000/teachers/assignment-evaluation
param: {
    class_room_id: int
}
type: POST

check file submitted of classroom assessment : http://127.0.0.1:4000/teachers/check-file-submitted-lists/
param: {
    assessment_id: int
}
type: POST

give marks to submitted of classroom assessment by students : http://127.0.0.1:4000/teachers/give-marks/
param: {
    submission_id: int
    marks : VARCHAR
}
type: POST

get classroom lists : http://127.0.0.1:4000/teachers/classroom-lists
header:{
Authorization: Bearer token_string
} 

=============================================================
route for Students : 

Studend enroll to class : http://127.0.0.1:4000/students/enrolment
param: {
    classroom_code: int
    name : VARCHAR
    email : VARCHAR
    school_id : VARCHAR
    password: VARCHAR
}
type: POST

GET class assessment lists : http://127.0.0.1:4000/classroom/class-assessment-lists
param: {
    invite_code: varchar
}
type: POST

GET class assessment lists by students enrollment : http://127.0.0.1:4000/students/get-class-assessment-lists
param: {
    classroom_code: varchar
}
type: POST

Submit assessment : http://127.0.0.1:4000/students/submit-assessment
param: {
    classroom_code: varchar,
    subject_assessment_id: INT
    file_info: TEXT
}
type: POST

GET assessment marks: http://127.0.0.1:4000/students/assessment-marks-data
param: {
    assessment_id: INT
}
type: POST

GET All classroom lists : http://127.0.0.1:4000/classroom/classroom-lists
type: GET
