var ApiBuilder = require('claudia-api-builder');
var api = new ApiBuilder();

module.exports = api;

api.post('/contact', function (request) {
	'use strict';
	var nodemailer = require('nodemailer');
	const transporter = nodemailer.createTransport({
		service: 'Mailgun',
		port: 465,
		auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD
		}
	});

	const mailOptions = {
		from: process.env.EMAIL_ADDRESS, // sender address
		to: request.body.email,
		subject: 'New contact form submission', // Subject line
		text: JSON.stringify(request.body) // plaintext body
	}

	 return transporter.sendMail(mailOptions).then(function(error, info) {
			if (error) {
				return 'Hmm... Sorry there was an error. Please send as an email to team@gorepp.com instead!';
			} else {
				return 'Thanks we\'ll be in contact soon!';
			}
  });
}, { success: 201 });
