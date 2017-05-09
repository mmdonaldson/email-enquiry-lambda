const ApiBuilder = require('claudia-api-builder');
const querystring = require('querystring');
const AWS = require('aws-sdk');
const shortid = require('shortid');

const api = new ApiBuilder();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports = api;

api.post('/contact', (request) => {
	'use strict';
	const nodemailer = require('nodemailer');
	const transporter = nodemailer.createTransport({
		service: 'Mailgun',
		port: 465,
		auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD
		}
	});

	let text = "";
	const body = querystring.parse(request.body);
	Object.keys(body).forEach((key) => {
	    text += key + ": " + body[key] + "\n";
	});

	const mailOptions = {
		from: process.env.EMAIL_USER, // sender address
		to: process.env.EMAIL_ADDRESS,
		subject: 'New contact form submission', // Subject line
		text // plaintext body
	}

	const time = new Date();
	const id = shortid.generate();
	const params = {
		TableName: 'contact',
		Item: {
			id,
			email: body.email,
			name: body.name === '' ? null : body.name,
			location: body.location === '' ? null : body.location,
			phone: body.phone === '' ? null : body.phone,
			message: body.message === '' ? null : body.message,
			time: time.toString(),
		}
	};

	return transporter.sendMail(mailOptions)
		.then(function () {
			var dynamoPromise = dynamoDb.put(params).promise()
			return dynamoPromise.then(function (response) {
				return;
			})
			.catch(function (error) {
				console.log(error);
				throw error;
			})
		})
		.then(function() {
			return new api.ApiResponse('OK', {'Content-Type': 'text/plain'}, 200);
		})
		.catch(function (error) {
			console.log('error: ', error);
			return new api.ApiResponse({ error }, {'Content-Type': 'text/plain'}, 400);
		});
});
