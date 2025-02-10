const express = require('express');
const { sendMail } = require('../helpers/mailer');
const { otpTemplate } = require('../helpers/otpTemplate');
const { getOTP } = require('../helpers/otpGenerator');
const { sendOtp } = require('../helpers/mobileVerification');
const MobileUser = require('../schema/mobileUser');
const Agent = require('../schema/agents');
const router = express.Router();

// Add logging middleware for debugging
router.use((req, res, next) => {
    console.log('Auth Route Request:', {
        method: req.method,
        path: req.path,
        body: req.body
    });
    next();
});

// New user registration
router.post('/new-user', async (req, res) => {
    try {
        console.log('New user registration attempt:', req.body.email);
        const { name, email, password, number } = req.body;
        
        const users = await MobileUser.find({ number });
        if (users.length) {
            console.log('User already exists with number:', number);
            res.status(200).send({ message: 'User already exist', status: 200 });
        } else {
            const newUser = new MobileUser({ name, email, password, number });
            await newUser.save();
            console.log('New user created successfully:', email);
            res.status(200).send({ message: 'User created successfully', status: 200 });
        }
    } catch (error) {
        console.error('Error in new-user route:', error);
        res.status(400).send({ message: 'Something went wrong', status: 400 });
    }
});

// User login
router.post('/user-login', async (req, res) => {
    try {
        console.log('User login attempt for number:', req.body.number);
        const { number, password } = req.body;
        
        const user = await MobileUser.findOne({ number });
        if (user) {
            if (password === user.password) {
                console.log('Login successful for user:', user.name);
                res.status(200).send({ 
                    message: 'Login successful', 
                    healthId: user.healthId, 
                    id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    status: 200 
                });
            } else {
                console.log('Invalid password for user:', number);
                res.status(201).send({ message: 'Password incorrect', status: 201 });
            }
        } else {
            console.log('User not found:', number);
            res.send({ message: 'User not found', status: 404 });
        }
    } catch (error) {
        console.error('Error in user-login route:', error);
        res.status(500).send({ message: 'Something wents wrong', status: 500 });
    }
});

// Agent login
router.post('/agent-login', async (req, res) => {
    try {
        console.log('Agent login attempt for:', req.body.email);
        const { email, password } = req.body;
        
        const agent = await Agent.findOne({ email });
        if (!agent) {
            console.log('Agent not found:', email);
            return res.status(404).send({ message: 'Agent not found' });
        }

        if (agent.password !== password) {
            console.log('Invalid password for agent:', email);
            return res.status(400).send({ message: 'Invalid password' });
        }

        console.log('Agent login successful:', agent.name);
        res.status(200).send({
            message: 'Login successful',
            agentId: agent.agentID,
            id: agent._id,
            name: agent.name
        });
    } catch (error) {
        console.error('Agent login error:', error);
        res.status(500).send({ message: 'Something went wrong during login' });
    }
});

// Send OTP to email
router.post('/send-otp', async (req, res) => {
    try {
        console.log('Sending OTP to email:', req.body.email);
        const { email, userName } = req.body;
        const otpCode = getOTP();
        const emailHtml = otpTemplate(userName, otpCode);
        
        await sendMail(email, 'Your OTP for Healthkard Verification', 'OTP verification', emailHtml);
        console.log('OTP sent successfully to:', email);
        res.status(200).send({ message: 'Successfully send the message', otpCode })
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send({ message: 'Unable to send email', error })
    }
});

// Send OTP to mobile
router.post('/send-mobile-otp', async (req, res) => {
    try {
        const mobileNumber = req.body.mobileNumber || '+919347235528';
        console.log('Sending OTP to mobile:', mobileNumber);

        if (!mobileNumber) {
            return res.status(400).send({ message: 'Mobile number is required' });
        }

        const otp = await sendOtp(mobileNumber);
        console.log('Mobile OTP sent successfully to:', mobileNumber);
        res.status(200).send({ message: 'OTP sent successfully', otp });
    } catch (error) {
        console.error('Failed to send mobile OTP:', error);
        res.status(500).send({ message: 'Unable to send OTP', error });
    }
});

// Check email existence
router.post('/check-email', async (req, res) => {
    try {
        console.log('Checking email existence:', req.body.email);
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }

        const user = await MobileUser.findOne({ email });
        console.log('Email check result:', email, user ? 'exists' : 'available');
        if (user) {
            res.status(200).send({ exists: true, message: 'Email already exists' });
        } else {
            res.status(200).send({ exists: false, message: 'Email is available' });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).send({ message: 'Something went wrong while checking email' });
    }
});

// Check number existence
router.post('/check-number', async (req, res) => {
    try {
        console.log('Checking number existence:', req.body.number);
        const { number } = req.body;
        
        if (!number) {
            return res.status(400).send({ message: 'Phone number is required' });
        }

        const user = await MobileUser.findOne({ number });
        console.log('Number check result:', number, user ? 'exists' : 'available');
        if (user) {
            res.status(200).send({ exists: true, message: 'Phone number already exists' });
        } else {
            res.status(200).send({ exists: false, message: 'Phone number is available' });
        }
    } catch (error) {
        console.error('Error checking number:', error);
        res.status(500).send({ message: 'Something went wrong while checking phone number' });
    }
});

// Send password to email
router.post('/send-password', async (req, res) => {
    try {
        console.log('Password recovery request for:', req.body.email);
        const { email } = req.body;

        const user = await MobileUser.findOne({ email });
        if (!user) {
            console.log('User not found for password recovery:', email);
            return res.status(404).send({ message: 'User not found with this email' });
        }

        const emailHtml = `<p>Your permanent password is: <strong>${user.password}</strong></p>
                          <p>Please change your password after logging in.</p>`;
        await sendMail(email, 'Your Permanent Password for Healthkard', 'Permanent Password', emailHtml);
        
        console.log('Password sent successfully to:', email);
        res.status(200).send({ message: 'Password sent to your email', status: 200 });
    } catch (error) {
        console.error('Error sending password:', error);
        res.status(500).send({ message: 'Failed to send password', error: error.message });
    }
});

// Admin login
router.post('/admin-login', async (req, res) => {
    try {
        console.log('Admin login attempt for:', req.body.email);
        const { email, password } = req.body;
        
        if (email === 'healthkard99@gmail.com' && password === 'Healthkard@99') {
            const token = Math.random().toString(36).substring(2, 12);
            console.log('Admin login successful');
            res.status(200).send({ message: 'Login successful', token: token, status: 200 });
        } else {
            console.log('Invalid admin credentials');
            res.status(400).send({ message: 'Invalid credentials', status: 400 });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).send({ message: 'Failed to send password', error: error.message });
    }
});

module.exports = router;