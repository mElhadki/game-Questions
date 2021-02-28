   // Endpoint testing with mocha and chai and chai-http

    // Import libraries
    const chai = require('chai');
    const chaiHttp = require('chai-http');
    const should = chai.should();
    var mongoose = require("mongoose");
    // Import servers
    var server = require('../server');

    // use chaiHttp for making the actual HTTP requests        
    chai.use(chaiHttp);

    describe('API', function() {

        it('login Admin, check token', function(done) {
         
                    // follow up with login
                    chai.request(server)
                        .post('/admin/login')
                        // send user login details
                        .send({
                            'phone': '0631686308',
                            'password': '0000'
                        })
                        .end((err, res) => {
                            console.log('this runs the login part');
                            res.body.should.have.property('token');
                            var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwM2E5MDBkMTM2ODI2NWMwYzgyMmFkNyIsInN1cGVyYWRtaW4iOnRydWUsImlhdCI6MTYxNDQ3MDkyMCwiZXhwIjoxNjE0NTU3MzIwfQ.AKju1nn6qgB1mAh30eQOrY4Mb3iUzKF30tCyHkfqGuU';

                            // follow up with requesting user protected page
                            chai.request(server)
                                .get('/question')
                                .set('x-access-token', token)
                                .end(function(error, res) {
                                    res.should.have.status(200);
                                   
                                    chai.request(server)
                                    .post('/question/add')
                                    .set('x-access-token', token)
                                    .send({
                       
                                        'question' : 'test',
                                        'trueanswer' : 'true',
                                        'falseanswer1' : 'false1',
                                        'falseanswer2' : 'false2',
                                        'falseanswer3' : 'false3',
                                        'point' : '12'
                                    })
                                   
                                    .end(function(error, res) {
                                        res.should.have.status(201);
                                        done();
                                    }) 
                                  
                                })
                        })
                    })          
        }) 