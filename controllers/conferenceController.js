"use strict";
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../libs/mailer");
const dbController = require('./dbController');
const ObjectId = require('mongodb').ObjectId;
const bcryptjs = require('bcryptjs');


function index(req, res) {
    res.status(200);
    
    if(req.session.authenticated){
        console.log("session authenticated");
        res.render("index.ejs", {
            username: req.session.name
        });
    }else{    
        res.render("login.ejs", {
            email: '',
            password: '',
            errorMessage: '',
        });
    }
}

function aboutUs(req, res) {
    res.status(200);
    res.render("about-us.ejs");
}

function faq(req, res) {
    res.status(200);
    res.render("faq.ejs");
}

function login(req, res) {
    
    if (req.session.authenticated) {
        //  console.log(req.session.name);
        // console.log("User is logged in. Status: "+ req.session.authenticated);
        res.status(200);
        /** Need to change the variable for session here */
        res.render("index.ejs", { username: req.session.name});

    }else{
        res.status(200);
        res.render("login.ejs",{
            email: '',
            password: '',
            errorMessage: '',
    
        });
    }    
    
}


function register(req, res) {

    if (req.session.authenticated) {
        //  console.log(req.session.name);
        // console.log("User is logged in. Status: "+ req.session.authenticated);
        res.status(200);
        /** Need to change the variable for session here */
        res.render("index.ejs", { username: req.session.name});

    }else{
   
        res.status(200);
        res.render("./register.ejs",{
            name: '',
            email: '',
            password: '',
            errorMessage: '',

        });
    }

}


function registerAuth(req, res) {

    // //Create new user in db
    const userName = req.body.name;
    const email = req.body.email;
    const plainPassword = req.body.password;
    const db = dbController.getDb();
    let errorMessage = "";

        db.collection('users').findOne( { email: email} )
        .then((dbResult) => {
            console.log("emailFind:" + dbResult);


            if(dbResult != null){ // If email is existing
                req.session.authenticated = false;
                req.session.save((err)=>{
                    console.log(err);
                });
                res.status(200);
                res.render("register.ejs", { name: userName, email: email, password: plainPassword} );
                // res.render("register.ejs", { username: userName, email: email, password: encryptedPassword, errorMessage: "Email is existing" } );
            
            // if there is no email existing (new user), create encript password and register
            }else{

                console.log("new user");
                bcryptjs.hash(plainPassword, 8)
                .then((encryptedPassword) => {
                    const newUserData = { username: userName, email: email,  password: encryptedPassword };
                    db.collection('users').insertOne(newUserData)
                        .then((dbResult) => {

                            req.session.authenticated = true;
                            req.session.name = userName;

                            req.session.save((err)=>{
                                console.log(err);
                            });

                            console.log(req.session.authenticated);
                            console.log(req.session.name);

                            // const passwordMatches = req.session.authenticated ? "Yes" : "No";
        
                            console.log(dbResult);
                            res.status(200);
                            
                            res.render("index.ejs", { username: userName});
                        })
                        .catch((err) => {
                            res.status(200);
                            res.render("register.ejs", { name: userName, email: email, password: plainPassword, errorMessage: "Error"} );
               
                        });
                })
                .catch((err) => {
                    res.status(200);
                    res.render("register.ejs", { name: userName, email: email, password: plainPassword, errorMessage: "Error"} );
               
                });
 
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(200);
            res.render("register.ejs", { name: userName, email: email, password: plainPassword, errorMessage: "Error"} );
        });
    // }
 

}

function loginAuth(req, res) {

   
    // //Create new user in db
    //const userName = req.body.name;
    const email = req.body.email;
    const plainPassword = req.body.password;
    const db = dbController.getDb();
    const errorMessage = "";

 
    console.log("User has not logged in");

    // Check if the email address exists in the database
    db.collection('users').findOne( { email: email} )
    .then((dbResult) => {

        // If email address does not exist, send error message.
        if(dbResult == null){
            req.session.authenticated = false;

            req.session.save((err)=>{
                console.log(err);
            });

            res.status(200);
            res.render("login.ejs", {email: email, password: '', errorMessage: 'Please input correct email address'} );

        // If email address exists
        }else{

            // Using bcryptjs to convert inputted password and compare if the password are matching
            bcryptjs.compare(plainPassword, dbResult.password)
            .then((encryptedPassword)=>{

                // If password is matching, user input correct email address and password.
                if (encryptedPassword){
                    req.session.authenticated = true;
                    req.session.name = dbResult.username; 

                    req.session.save((err)=>{
                        console.log(err);
                    });
                    
                    console.log(req.session.authenticated);
                    console.log(req.session.name);
                    res.status(200);
                    res.render("index.ejs", { username: dbResult.username});
                
                // If password is not matching, password user inputed is mistake.    
                } else {
                    req.session.authenticated = false;
                    res.status(200);
                    res.render("login.ejs", { email:email, password:plainPassword, errorMessage: "Please input correct email address and password"});
                }
                req.session.save((err)=>{
                    console.log(err);
                });  
                
            })
            .catch(err =>{
                console.log(err);
            });
        }  
    })
    .catch(err=>{
        console.log(err);
    });

}

function mongoWriteExample(req, res) {
    
    // Create new user in db
    const userName = 'Miho'; // just an example, this should be obtained from the request body of a form
    const plainPassword = 'Test12345'; // just an example, this should be obtained from the request body of a form
    const db = dbController.getDb();

    //lets check if the user has already logged in (i.e. is authenicated)
    if (req.session.authenticated) {
        console.log("User is logged in. Status: "+ req.session.authenticated);
    } else {
        console.log("User has not logged in");
    }

    //insert new user data, similar to account registration code
    bcryptjs.hash(plainPassword, 8)
        .then((encryptedPassword) => {
            const newUserData = { username: userName, password: encryptedPassword };
            db.collection('users').insertOne(newUserData)
                .then((dbResult) => {
                    console.log(dbResult);
                    res.status(200);
                    res.render("mongo-showall-example.ejs", { dbResultsArray: dbResults } );
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });

}


function mongoReadExample(req, res) {

    const db = dbController.getDb();

    //retrieve user that was just created by username, similar to login code
    const outputObject = {};
    const userName = 'Tom'; // just an example, this should be obtained from the request body of a form
    const plainPassword = 'superdupersecretpassword'; // just an example, this should be obtained from the request body of a form
    
    
    db.collection('users').findOne( { username: userName} )
        .then((dbResult) => {
            outputObject.username = dbResult.username;
            outputObject.password = dbResult.password;
            bcryptjs.compare(plainPassword, dbResult.password)
                .then((passwordTestResult)=>{

                    if (passwordTestResult){
                        req.session.authenticated = true;
                    } else {
                        req.session.authenticated = false;
                    }
                    req.session.save((err)=>{
                        console.log(err);
                    });

                    outputObject.passwordTestResult = passwordTestResult;
                    outputObject.passwordMatches = req.session.authenticated ? "Yes" : "No";

                    

                    res.status(200);
                    res.render("mongo-read-example.ejs", outputObject );
                    
                })
                .catch(err =>{
                    console.log(err);
                });

        })
        .catch(err=>{
            console.log(err);
        });

}


function mongoShowAllExample(req, res) {

    const db = dbController.getDb();
    db.collection('users').find().toArray()
        .then((dbResults) => {
                    res.status(200);
                    res.render("mongo-showall-example.ejs", { dbResultsArray: dbResults } );
        })
        .catch(err=>{
            console.log(err);
        });

}

// function lobby(req, res) {
//     res.render("lobby.ejs");
// }

function pageNotFoundError(req, res) {
    res.status(404);
    res.render("pagenotfound.ejs");
}

function serverError(req, res) {
    res.status(500);
    res.render("servererror.ejs");
}

function newRoom(req, res) {
    // 307 status code so that the body also gets redirected
    res.redirect(307, `/${uuidv4()}`);
}

function connectToRoom(req, res) {
    res.status(200);
    res.render("room", { roomId: req.params.room, username: req.body.name });
}

function sendInviteEmail(req, res) {
    var mailOptions = {
        to: req.body.email,
        html: req.body.html,
    };
    console.log(req.body.html);
    sendEmail(mailOptions);
    res.send("Sent");
}

exports.index = index;
exports.register = register;
//exports.lobby = lobby;
exports.pageNotFoundError = pageNotFoundError;
exports.serverError = serverError;
exports.newRoom = newRoom;
exports.connectToRoom = connectToRoom;
exports.sendInviteEmail = sendInviteEmail;
exports.mongoReadExample = mongoReadExample;
exports.mongoWriteExample = mongoWriteExample;
exports.mongoShowAllExample = mongoShowAllExample;
exports.aboutUs = aboutUs;
exports.faq = faq;
exports.register = register;
exports.registerAuth = registerAuth;
exports.login = login;
exports.loginAuth = loginAuth;
