var mysql = require('mysql');
const {faker} = require('@faker-js/faker');

var nodemailer = require('nodemailer');

var express = require('express');

var bodyParser=require("body-parser");

var connection = mysql.createConnection({

    host : 'localhost',
    user : 'root',
    password : '23-May-00',
    database : 'insurance_mgmt',
    multipleStatements: true,
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
    res.render('home');
});

app.get("/register",function(req,res){
    res.render('register');
});

app.get("/agent_login", (req,res)=>{
    res.render('agentLogin');
});

app.get("/admin_login", (req,res)=>{
    res.render('adminLogin');
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
                    // console.log(results)
                    res.render('policyDesc',{
                        type: req.query.picker,
                        policies: results,
                        clientid: req.query.clientId
                    });
                });
            }
            else{ 
        connection.query("SELECT * FROM agent_policy JOIN insurancepolicy ON policy_id=insurancepolicy.id INNER JOIN agent ON agent.system_id=agent_policy.agent_id WHERE policytype = ? AND policy_id NOT IN (?)",[req.query.picker,data],function(error,results){
            // console.log(results);
            res.render('policyDesc',{
                type: req.query.picker,
                policies: results
            });
        });}
    });
});

var dates =[]

app.post('/login',(req,res)=>{
    var q = "SELECT * FROM insurancepolicy JOIN client_policy ON insurancepolicy.id = client_policy.policy_id  JOIN client ON client.id = client_policy.client_id WHERE client_id=?";
    connection.query(q,req.body.userid, (err,results)=>{

        connection.query('SELECT * FROM client WHERE id=?',req.body.userid, function(error,results2){

            var temp = new Date();
            temp.setDate(temp.getDate()+ 40);
            for(var k= 0;k<results.length;k++){
                var d = new Date() ;
                var passedDays= (d.getTime() -results[k].enrolled_on.getTime() )/1000/60/60/24;
                passedDays = Math.floor(passedDays);
                var remDays = 180 - passedDays%180;
                d.setDate(d.getDate()+remDays);
                dates.push(d);
            }
            
            if(results2[0].name==req.body.name){
                res.render('clientPage',{
                    name: req.body.name,
                    password: req.body.userid,
                    types: types,
                    data: results,
                    dates: dates
                });
            }
            else {
                res.render('home');
            };
        });        
    });
});

app.post('/informAgent',(req,res)=>{
    console.log(req.body);
    var request = {
        client_id: req.body.clientid,
        agent_id: req.body.agentid,
        policy_id: req.body.policyid
    }
    var q1 = `IF NOT EXISTS (SELECT client_id,policy_id FROM client_policy WHERE client_id=${req.body.clientid} AND policy_id=${ req.body.policyid} );`
    var q = 'INSERT INTO request  SET ?';
    connection.query(q,request,(err,res)=>{
        if(err)console.log(err);
        // console.log(res);
    });
})

app.post('/agentLogin', (req,res)=>{
    // console.log(req.body);
    connection.query('SELECT name,system_id FROM agent WHERE agent.name =?',req.body.username, (err,result)=>{
        if(err)console.log(err);
        // console.log(req.body.username)
        if(result[0].name == req.body.username && result[0].system_id==req.body.password){
            connection.query('SELECT client_id,client.name,client.email,policy_id,policytype,policyvalue,duration,requested_at,agent.system_id FROM agent JOIN request ON agent.system_id= request.agent_id  JOIN insurancepolicy ON insurancepolicy.id = policy_id JOIN client ON client.id = client_id WHERE agent.system_id=?',req.body.password, (err1,res1)=>{
                if(err1)console.log(err1);
                // console.log(res1);
                res.render('agentPage',{
                    name: req.body.username,
                    data: res1,
                    password: req.body.password
                });
            })
        }
        else {
            res.render('agentLogin');
        }
    });
    // var q = 'SELECT * FROM agent_policy JOIN insurancepolicy ON policy_id = insurancepolicy'
    // connection.query()s
});
app.post('/assignPolicy',(req,res)=>{
    var q = 'INSERT INTO client_policy SET ?;'
    // q+= 'INSERT INTO '
    connection.query(q,{client_id: req.body.client_id,policy_id: req.body.policy_id, agent_id: req.body.agent_id},(err2,res2)=>{
        if(err2)console.log(err2);
        console.log("client_policy updated")
        connection.query('DELETE FROM request WHERE client_id=? AND policy_id=?',[req.body.client_id,req.body.policy_id],(err3,re3)=>{
            if(err3)console.log(err3);
            console.log("reques deleted");
            connection.query('SELECT client_id,client.name,client.email,policy_id,policytype,policyvalue,duration,requested_at FROM agent JOIN request ON agent.system_id= request.agent_id  JOIN insurancepolicy ON insurancepolicy.id = policy_id JOIN client ON client.id = client_id WHERE agent.system_id=?',req.body.password, (err1,res1)=>{
                if(err1)console.log(err1);
                // console.log(res1);
                res.render('agentPage',{
                    name: req.body.username,
                    data: res1,
                    password: req.body.password
                });
            });
        })
    })
})

app.get('/adminLogin', (req,res)=>{
    var q = 'SELECT company.name,policytype,duration,policyvalue,agent.name AS agent_name FROM company JOIN company_policy ON company.id=company_policy.company_id JOIN insurancepolicy ON insurancepolicy.id = company_policy.policy_id JOIN agent_policy ON agent_policy.policy_id=insurancepolicy.id JOIN agent ON agent.system_id = agent_policy.agent_id'
    connection.query(q,(err,results)=>{
        res.render('allPolicies',
        {results: results}
        );
    })
});

app.post('/addPolicy',(req,res)=>{

    var companyname = req.body.company;
    var agentname = req.body.agent;
    var newpolicy ={
        policytype: req.body.policytype,
        duration: req.body.duration,
        policyvalue: req.body.policyvalue,
    };

    q2 = 'SELECT system_id FROM agent_policy JOIN agent ON agent.system_id=agent_policy.agent_id WHERE agent.name = ? ;';
    q2+= 'SELECT COUNT(*) AS count FROM insurancepolicy;';
    q2+= `SELECT id  FROM company WHERE company.name = ?;`
    connection.query(q2,[agentname,companyname], (error, results1)=>{
        if(error)console.log(error);
        // console.log(results1[0]);
        var newpolicyid = results1[1][0].count+1;
        
        // console.log(results1);
        connection.query('INSERT INTO insurancepolicy SET ?',newpolicy, (err2,results2)=>{
            if(err2)console.log(err2);
            var policyagentid;
            if(results1[0].length ==0){
                console.log("empty set");
                connection.query('SELECT system_id FROM agent WHERE name = ?',agentname,(err5,res5)=>{
                    if(err5)console.log(err5);
                    // console.log("res5  s")
                    // console.log(res5[0].system_id);
                    policyagentid=res5[0].system_id;
                var agpol = {policy_id: newpolicyid,agent_id: policyagentid};

                    connection.query("INSERT INTO agent_policy SET ? ",agpol,(err3,results3)=>{
                        if(err3)console.log(err3);
                        // console.log(results3);
                        connection.query("INSERT INTO company_policy SET ?",{company_id: results1[2][0].id,policy_id: newpolicyid}, (err4, results4)=>{
                            if(err4)console.log(err4);
                            // console.log(results4);
                            res.redirect('/adminLogin');
                            });
                    });
                })
            }
            else{
                policyagentid = results1[0][0].system_id;
                var agpol = {policy_id: newpolicyid,agent_id: policyagentid};

                // console.log("policyagentid===",policyagentid)
                connection.query("INSERT INTO agent_policy SET ? ",agpol,(err3,results3)=>{
                    if(err3)console.log(err3);
                    // console.log(results3);
                    connection.query("INSERT INTO company_policy SET ?",{company_id: results1[2][0].id,policy_id: newpolicyid}, (err4, results4)=>{
                        if(err4)console.log(err4);
                        // console.log(results4);
                        res.redirect('/adminLogin');
                        // var q = 'SELECT company.name,policytype,duration,policyvalue,agent.name AS agent_name FROM company JOIN company_policy ON company.id=company_policy.company_id JOIN insurancepolicy ON insurancepolicy.id = company_policy.policy_id JOIN agent_policy ON agent_policy.policy_id=insurancepolicy.id JOIN agent ON agent.system_id = agent_policy.agent_id'
                    });
                });
            }
    });
});

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
    // console.log(results);
    res.redirect('/');
    });
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
