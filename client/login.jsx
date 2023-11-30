const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const { useState, useEffect } = React;

const handleLogin = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });

    return false;
}

const handleSignup = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match');
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });

    return false;
}

const SignupWindow = (props) => {
    return (
        <div id="signup-container">
            <h1 id='create-header'>Create an Account</h1>
            <form id="signupForm"
                name="signupForm"
                onSubmit={handleSignup}
                action="/signup"
                method="POST"
                className="mainForm"
            >
                <label htmlFor="username"></label>
                <input id="user" type="text" name="username" placeholder="username" />
                <label htmlFor="pass"></label>
                <input id="pass" type="password" name="pass" placeholder="password" />
                <label htmlFor="pass"></label>
                <input id="pass2" type="password" name="pass2" placeholder="retype password" />
                <input className="formSubmit" type="submit" value="Create Account" />
            </form>
        </div>
    );
};

const LoginWindow = (props) => {
    return (
        <div id="signup-container">
            <h1 id='create-header'>Login</h1>
            <form id="loginForm"
                name="loginForm"
                onSubmit={handleLogin}
                action="/login"
                method="POST"
                className="mainForm"
            >
                <label htmlFor="username"></label>
                <input id="user" type="text" name="username" placeholder="username" />
                <label htmlFor="pass"></label>
                <input id="pass" type="password" name="pass" placeholder="password" />
                <input className="formSubmit" type="submit" value="Sign In" />
            </form>
        </div>
    );
};

const HandleClick = (toggleBtn) => {
    if (toggleBtn.innerHTML === 'Create Account') {
        document.querySelector('#login-error').innerHTML = '';
        toggleBtn.innerHTML = 'Go Back to Login';
        ReactDOM.render(<SignupWindow />,
            document.getElementById('login-input'));
    } else {
        document.querySelector('#login-error').innerHTML = '';
        toggleBtn.innerHTML = 'Create Account';
        ReactDOM.render(<LoginWindow />,
            document.getElementById('login-input'));
    }
}

const init = () => {
    const signupButton = document.querySelector('#login-swap');

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        HandleClick(signupButton);
        return false;
    });

    ReactDOM.render(<LoginWindow />,
        document.querySelector('#login-input'));
};

window.onload = init;