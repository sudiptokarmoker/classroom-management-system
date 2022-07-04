const config = require('config.json');
const jwt = require('jsonwebtoken');
const Role = require('_helpers/role');
const {pool} = require('./../db/connection.js');
const bcrypt = require('bcrypt');

// users hardcoded for simplicity, store in a db for production applications
const users = [
    { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User', role: Role.Admin },
    { id: 2, username: 'user', password: 'user', firstName: 'Normal', lastName: 'User', role: Role.User }
];

module.exports = {
    authenticate,
    getAll,
    getById,
    signUp
};
/*
function comparePasswords(password, callback)
{
  bcrypt.compare(password, 'test', function(error, isMatch) {
    if(error) {
      return callback(error);
    }
    return callback(null, isMatch);
  });
}
*/

function signUp(req){
    const {name, email, password} = req.body;
    // return {
    //     name, email, password
    // };
    pool.query("SELECT * FROM users WHERE email = ?", [email] , (err, data, field) => {
        if(err) {
            console.error(err);
            return;
        }
        if(data && data.length > 0){
            return {
                status: false
            }
        }
        console.log("calling");
        // insert into db
        const saltRounds = 10;
        const pass = bcrypt.hashSync(password, saltRounds);
        pool.query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)", [name, email, pass, 'admin', new Date()], (err, data, fields) => {
            if(err) console.log(err);
            return {
                status: "success",
                _data: data, 
            };
        })
    });

    /*
    pool.query('SELECT 1', function (err, result) {
        return {
            result
        };
    });
    */

  

    pool.query('SELECT 1', function (err) {
        return {
            data: "test"
        };
    });

    try{
        // return {
        //     status: false,
        //     message: "user is already exists"
        // }
        // const pass = password;
        // const saltRounds = 10;
        // password = bcrypt.hashSync(pass, saltRounds);

        // console.log("logging password");
        // console.log(password);

        //const passwordDycript = await bcrypt.hash('test', 10);
        //console.log(passwordDycript);

        //return res.send("test");
       // const isValid = await bcrypt.compare('$2b$10$PvGOLzNGgT44p6TyAy41Be./Wv.0OenpVrnNWzvvCnERH9SI/gDmC', 'test', );
       // const isValid = await bcrypt.compare(req.body.password, user.password)
       // if (!isValid) console.log("not valid password")
       // else console.log("valid password");

        // testing compare password here
        // bcrypt.compare('$2b$10$vWKLk8C8v.uBGP8N6mJZvuFpQktEyJPJawTbF8DK6g8Oz3SzyI7aK', 'test', function(error, isMatch){
        //     if(error) {
        //         return callback(error);
        //       }
        //       return callback(null, isMatch);
        // });
       // return res.send("stopped....");
        // end  of compare password here
        // now we can insert this user
        // const salt = await bcrypt.genSalt(10);
        // const pass = await bcrypt.hash(password, salt);

        pool.query('SELECT 1', function (err) {
            return {
                status: true
            }
        });


       pool.query("SELECT * FROM users WHERE email = ?", [email] , (err, data, field) => {
            if(err) {
                console.error(err);
                return;
            }
           /// console.log(data);
            return {
                user: field
            };

            // rows fetch
            if(data && data.length > 0){
                console.log("user already exits.");
                return {
                    user: false
                };
            }
            // now insert
            pool.query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)", [name, email, pass, 'admin', new Date()], (err, data, fields) => {
                if(err) console.log(err);
                console.log("User created successfully");
                return {
                    user: true
                };
            })
        });

        /*
        pool.query("SELECT * FROM users WHERE username = ?", [username] , function (err, result) {
            if (err) throw err;
            if (result && result.rows && result.rows.length > 0) {
                return {
                    status: false,
                    message: "Username already into system"
                }
            } else {
                return {
                    status: true,
                    message: "this user is valid for insert"
                }
            }
        });   
        */
    } catch(error){
        return error;
    }
}

async function authenticate({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);
    //const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const token = jwt.sign({ sub: user.id, role: user.role }, config.secret);
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token
        };
    }
}

// authonticate by email and password
async function authenticateByEmailAndPassword({ email, password }) {
    
    //const user = users.find(u => u.username === username && u.password === password);
    const user = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [username])
    if (user) {
        const token = jwt.sign({ sub: user.id, role: user.role }, config.secret);
        return {
            token
        };
    }
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

async function getById(id) {
    const user = users.find(u => u.id === parseInt(id));
    if (!user) return;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}