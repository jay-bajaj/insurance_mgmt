var mysql = require('mysql');
const {faker} = require('@faker-js/faker');
// var popups =require('popups');

var express = require('express');

var bodyParser=require("body-parser");

var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '23-May-00',
    database : 'insurance_mgmt',
    
});

var app = express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));


var people = [];
var commissions = [0.1,0.15];

var clients = []
// client template
for(var i= 0;i<50;i++){
    clients.push([
        faker.name.firstName(),
        faker.phone.number(),
        faker.address.city(),
        faker.internet.email(),
        faker.date.past()
    ]);   
};

var company = ["LIC","BAJAJ ALLIANZ","TATA AIG"];
// agent template 
for(var i= 0;i<4;i++){
    people.push([
        faker.name.firstName(),
        Math.floor(Math.random()*company.length)+1,
        commissions[Math.floor(Math.random()*2)]
    ]);   
};

var types = ["Car","Home","General","Life","Business","Phone","Travel"]
var amounts = [500000,1000000,10000000,20000000];
var months = [24,36,60,120]



app.get("/",function(req,res){
    // res.send("Start from this page");
    res.render('home');
});

app.get("/register",function(req,res){
    res.render('register');
});

app.get("/agent_login", (req,res)=>{
    res.render('agentLogin');
})

app.get('/particular', function(req,res){
    // console.log(req);
    connection.query("SELECT insurancepolicy.id FROM insurancepolicy JOIN client_policy ON insurancepolicy.id=client_policy.policy_id  WHERE policytype=? AND client_id =? ",[req.query.picker,req.query.clientId], function(err,results1){
        var data =[];
        for(var i=0;i<results1.length;i++){
            data.push(results1[i].id);}
            if(data.length ==0)
            {
                connection.query("SELECT * FROM agent_policy JOIN insurancepolicy ON policy_id=insurancepolicy.id INNER JOIN agent ON agent.system_id=agent_policy.agent_id WHERE policytype = ?",req.query.picker,function(error,results){
                    res.render('policyDesc',{
                        type: req.query.picker,
                        policies: results
                    });
                });
            }
            else{ 
        connection.query("SELECT * FROM agent_policy JOIN insurancepolicy ON policy_id=insurancepolicy.id INNER JOIN agent ON agent.system_id=agent_policy.agent_id WHERE policytype = ? AND policy_id NOT IN (?)",[req.query.picker,data],function(error,results){
            res.render('policyDesc',{
                type: req.query.picker,
                policies: results
            });
        });}
    });
});

app.post('/login',(req,res)=>{
    var q = "SELECT * FROM insurancepolicy JOIN client_policy ON insurancepolicy.id = client_policy.policy_id  JOIN client ON client.id = client_policy.client_id WHERE client_id=?";
    connection.query(q,req.body.userid, (err,results)=>{
        // console.log(results);
        connection.query('SELECT * FROM client WHERE id=?',req.body.userid, function(error,results2){
            console.log(results2);
            if(results2[0].name==req.body.name){
                res.render('clientPage',{
                    name: req.body.name,
                    password: req.body.userid,
                    types: types,
                    data: results
                });
            }
            else {
                // popups.alert({
                //     content: 'Worng username or id'
                // });
                res.render('home');
            };
        });        
    });
    
    // console.log(req.body);
});
app.post('/signup', function(req,res){
    var person = {
        name: req.body.name_field,
        contact: req.body.contact,
        address: req.body.address,
        email: req.body.email
    }
    connection.query('INSERT INTO client SET ?',person,(err,results)=>{
    if(err)console.log(err);
    console.log(results);
    res.redirect('/');
    })
});




app.listen(3000,'localhost', ()=>{
    console.log("App listening on port 3000");
});


// var company = []

// //company template
// for(var i= 0;i<3;i++){
//     company.push([
//         faker.company.name(),
//     ]);
// };



var policies =[]
// policy template
for(var i= 0;i<30;i++){
    policies.push([
        types[Math.floor(Math.random()*types.length)],
        amounts[Math.floor(Math.random()*amounts.length)],
        months[Math.floor(Math.random()*months.length)]
    ]);   
};




//adding clients randomly
// connection.query("INSERT INTO client (name,contact,address,email,created_at) VALUES ?",[clients], 
// function(err, results){
//     if(err) throw err;
//     console.log(results);
// });

//adding agents randomly
// connection.query("INSERT INTO agent (name,company_id,commission) VALUES ?",[people], function(err, results){
//     if(err) throw err;
//     console.log(results);
// });

//adding companies 
// connection.query("INSERT INTO company (name) VALUES ?",[company], function(err, results){
//     if(err) throw err;
//     console.log(results);
// });

//adding policies
// connection.query("INSERT INTO insurancepolicy (policytype,policyvalue,duration) VALUES ?",[policies], function(err, results){
//     if(err) throw err;
//     console.log(results);
// });

// console.log(people);

connection.close;
// console.log("hello");
