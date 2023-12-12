const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const { useState, useEffect } = React;

// method that utilizes the sendPost helper method
// contacts the server when someone tries to log in
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

// method that utilizes the sendPost helper method
// contacts the server to update it with a new account
const handleSignup = (e) => {
    e.preventDefault();

    // basic checks to make sure all the fields are filled out
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

// sign up react component that lets users create a nwe account
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

// react component that allows users to log into their account
// and proceed to the app
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

// method that sets and displays different things when
// the create account button is clicked
const HandleClick = (toggleBtn) => {
    const errorText = document.querySelector('#login-error');
    if (toggleBtn.innerHTML === 'Create Account') {
        errorText.innerHTML = '';
        errorText.setAttribute('style', 'padding-top: 15px');
        toggleBtn.innerHTML = 'Go Back to Login';
        ReactDOM.render(<SignupWindow />,
            document.getElementById('login-input'));
    } else {
        errorText.innerHTML = '';
        errorText.removeAttribute('style', 'padding-top: 15px');
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

    // window starts on the log in screen
    ReactDOM.render(<LoginWindow />,
        document.querySelector('#login-input'));
};

window.onload = init;