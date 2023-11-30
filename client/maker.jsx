const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

// const handleDomo = (e) => {
//     e.preventDefault();
//     helper.hideError();

//     const name = e.target.querySelector('#domoName').value;
//     const age = e.target.querySelector('#domoAge').value;
//     const color = e.target.querySelector('#domoColor').value;

//     if (!name || !age || !color) {
//         helper.handleError('All fields are required');
//         return false;
//     }

//     helper.sendPost(e.target.action, {name, age, color}, loadDomosFromServer);

//     return false;
// }

const handleMessage = (e) => {
    e.preventDefault();

    const text = e.target.querySelector('#messageInput').value;

    if (!text) {
        helper.handleError('All fields are required');
        return false;
    }

    socket.emit('chat message', text);
    console.log('success');

    helper.sendPost(e.target.action, {text});

    return false;
}

const MessageForm = (props) => {
    return (
        <form id="postForm"
            onSubmit={handleMessage}
            name="messageForm"
            action="/maker"
            method="POST"
            className="messageForm"
        >
            <textarea id="messageInput" type="text" name="message" placeholder="Message" />
            <input id="postBtn" className="emitMessage" type="submit" value="Post"/>
        </form>
    )
}

const DomoList = (props) => {
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className='emptyDomo'>No Domos Yet</h3>
            </div>
        )
    }

    const domoNodes = props.domos.map(domo => {
        return (
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className='domoFace' />
                <h3 className='domoName'>Name: {domo.name}</h3>
                <h3 className='domoAge'>Age: {domo.age}</h3>
                <h3 className='domoColor'>Color: {domo.color}</h3>
            </div>
        );
    });

    return (
        <div className='domoList'>
            {domoNodes}
        </div>
    )
}

const changePass = (e) => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const pass3 = e.target.querySelector('#pass3').value;
    
    if (!username || !pass || !pass2 || !pass3) {
        helper.handleError('All fields are required');
        return false;
    }

    if (pass2 !== pass3) {
        helper.handleError('New passwords do not match');
    }

    helper.sendPost('/changePass', {username, pass, pass2, pass3});

    return false;
}

const ChangePassWindow = (props) => {
    return (
        <form id="changePassForm"
            name="changePassForm"
            onSubmit={changePass}
            action="/changePass"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Old Password: </label>
            <input id="pass" type="password" name="pass" placeholder="old password" />
            <label htmlFor="pass">New Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="new password" />
            <label htmlFor="pass">New Password: </label>
            <input id="pass3" type="password" name="pass3" placeholder="retype new" />
            <input className="formSubmit" type="submit" value="Change Password"/>
        </form>
    );
};

const loadDomosFromServer = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();

    ReactDOM.render(
        <DomoList domos={data.domos}/>,
        document.getElementById('domos')
    );
}

const loadMessagesFromServer = async () => {
    const response = await fetch('/getMessages');
    const data = await response.json();

    data.messages.forEach(message => {
        const fullMsg = {
            username: message.username,
            text: message.content,
        }
        displayMessage(fullMsg);
    });
}

const displayMessage = (msg) => {
    const messageDiv = document.createElement('div');
    messageDiv.innerText = `${msg.username}: ${msg.text}`;
    messageDiv.id = 'board';
    document.getElementById('messages').prepend(messageDiv);
}

const init = () => { 
    ReactDOM.render(
        <MessageForm />,
        document.getElementById('MessageForm')
    );

    loadMessagesFromServer();

    socket.on('chat message', displayMessage);
}

window.onload = init;