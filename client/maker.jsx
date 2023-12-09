const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
const { useState, useEffect } = React;

const socket = io();

const handleMessage = (e) => {
    e.preventDefault();

    let content = e.target.querySelector('#messageInput').value;

    if (!content) {
        helper.handleError('All fields are required');
        return false;
    }

    socket.emit('chat message', content);
    content = '';

    return false;
}

const MessageForm = (props) => {
    const [charLim, setCharLim] = useState(100);
    const [count, setCount] = useState(100);

    useEffect(async () => {
        const response = await fetch('/isPremium');
        const premiumBool = await response.json();

        console.log(premiumBool.premium);
        if (premiumBool.premium) {
            setCharLim(500);
            setCount(500);
        }
    }, []);

    return (
        <form id="postForm"
            onSubmit={handleMessage}
            name="messageForm"
            action="/maker"
            method="POST"
            className="messageForm"
        >
            <textarea id="messageInput"
                type="text"
                name="message"
                placeholder="Message"
                maxLength={charLim}
                onChange={e => setCount(charLim - e.target.value.length)} />
            <input id="postBtn" className="emitMessage" type="submit" value="Post" />
            <p id='letterCount'>{count}</p>
        </form>
    )
}

const MessageContainer = (props) => {
    const [messages, setMessages] = useState(props.messages);

    useEffect(async () => {
        const response = await fetch('/getMessages');
        const messageArray = await response.json();
        setMessages(messageArray);
        // console.log(messages);
    }, []);

    const sortMessages = (msg) => {
        setMessages(old => [msg, ...old]);
    }

    const updateLikes = (data) => {
        console.log("message Liked");
        const tempMessages = [...messages];

        tempMessages.forEach(message => {
            if (message._id === data.messageId) {
                console.log(data.likeCount);
                message.likeCount = data.likeCount;
            }
        });
        setMessages(tempMessages);
    };

    useEffect(() => {
        socket.on('chat message', sortMessages);
        return () => socket.off('chat message', sortMessages);
        // socket.on('like post', updateLikes);
    }, [messages]);

    useEffect(() => {
        socket.on('like post', updateLikes);
    }, [messages]);

    const handleLike = async (e, id) => {
        e.preventDefault();
        socket.emit('like post', id);
        return false;
    }

    const handleFollow = async (e, id) => {
        e.preventDefault();
        console.log(id);
        const response = await fetch('/addFollowed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id}),
        });
        return false;
    }

    if (messages.length === 0) {
        return (
            <div>
            </div>
        );
    }

    const messageList = messages.map(message => {
        console.log(message);
        return (
            <div key={message._id}>
                <h3>{message.username}: <p>{message.content}</p></h3>
                <p>{message.likeCount} Likes</p>
                <button type='submit' onClick={(e) => handleLike(e, message._id)}>Like</button>
                {!message.isOwnPost &&
                    <button type='submit' onClick={(e) => handleFollow(e, message._id)}>Follow</button>
                }
            </div>
        )
    });

    return (
        <div>
            {messageList}
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

    helper.sendPost('/changePass', { username, pass, pass2, pass3 });

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
            <input className="formSubmit" type="submit" value="Change Password" />
        </form>
    );
};

const displayMessage = (msg) => {
    const messageDiv = document.createElement('div');
    messageDiv.innerText = `${msg.username}: ${msg.text}`;
    messageDiv.id = 'board';
    document.getElementById('messages').prepend(messageDiv);
}

const init = async () => {
    const changePassButton = document.getElementById('changePassButton');
    const main = document.getElementById('mainScreenButton');
    const premiumBtn = document.getElementById('activatePremium');

    changePassButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<ChangePassWindow />,
            document.getElementById('MessageForm'));
        document.querySelector('#messages').style.display = 'none';
        return false;
    });

    main.addEventListener('click', e => {
        e.preventDefault();
        ReactDOM.render(<MessageForm />,
            document.getElementById('MessageForm'));
        document.querySelector('#messages').style.display = 'block';
        return false;
    })

    premiumBtn.addEventListener('click', async e => {
        const response = await fetch('/setPremium', { method: 'post' });
    })

    ReactDOM.render(
        <MessageForm />,
        document.getElementById('MessageForm')
    );

    ReactDOM.render(
        <MessageContainer messages={[]} />,
        document.getElementById('messages')
    );
}

window.onload = init;