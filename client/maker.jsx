const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
const { useState, useEffect } = React;

const socket = io();

// utilizes socket.io to emit messages to all users
// used to real time interaction
const handleMessage = (e) => {
    e.preventDefault();

    let content = e.target.querySelector('#messageInput').value;

    if (!content) {
        helper.handleError('All fields are required');
        return false;
    }

    socket.emit('chat message', content);
    // resets the message box content when the user clicks post
    content = '';

    return false;
}

// react component that is the field for writing and posting
// messages, utilizes useState to set things based
// on premium status
const MessageForm = (props) => {
    // character limit for the text area
    const [charLim, setCharLim] = useState(100);
    // counter for visual purposes
    const [count, setCount] = useState(100);

    // on page load based on if the account is premium or not
    // sets the message limit differently 
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
                // the user's character limit is based on premium status
                maxLength={charLim}
                // this method just displays how many characters left
                // a user has in their message
                onChange={e => setCount(charLim - e.target.value.length)} />
            <input id="postBtn" className="emitMessage" type="submit" value="Post" />
            <p id='letterCount'>{count}</p>
        </form>
    )
}

// react component that displays all the messages on the screen
// uses a lot of socket.io to make things work in real time
const MessageContainer = (props) => {
    const [messages, setMessages] = useState(props.messages);

    // gets messages on page load and sets the messages array
    useEffect(async () => {
        const response = await fetch('/getMessages');
        const messageArray = await response.json();
        setMessages(messageArray);
    }, []);

    // fires when users post messages
    // return statement is so that it doesn't fire 
    // multiple times
    useEffect(() => {
        socket.on('chat message', sortMessages);
        return () => socket.off('chat message', sortMessages);
    }, [messages]);

    // fires when users like posts
    useEffect(() => {
        socket.on('like post', updateLikes);
    }, [messages]);

    // fires when users click follow on a post
    // return statement is so that it doesn't fire 
    // multiple times
    useEffect(() => {
        socket.on('follow user', updateFollowButtons);
        return () => socket.off('follow user', updateFollowButtons);
    }, [messages]);

    // orders the messages so that new messages are on the top
    const sortMessages = (msg) => {
        setMessages(old => [msg, ...old]);
        document.querySelector('#messageInput').value = '';
    };

    // goes through all the messages and updates
    // their like count to reflect the database
    const updateLikes = (data) => {
        console.log("message Liked");
        const tempMessages = [...messages];

        // finds correct message and sets like count
        tempMessages.forEach(message => {
            if (message._id === data.messageId) {
                console.log(data.likeCount);
                message.likeCount = data.likeCount;
            }
        });

        setMessages(tempMessages);
    };

    // updates the isFollowed bool for messages
    // this switches the next of the button
    // based on whether the account is followed or not
    const updateFollowButtons = (data) => {
        const tempMessages = [...messages];

        // sets isFollowed bool for all messages by
        // the indicated user
        tempMessages.forEach(message => {
            if (message.sender === data.sender) {
                message.isFollowed = data.followBool;
            }
        });
        
        setMessages(tempMessages);
    };

    // socket.io emit function
    const handleLike = async (e, id) => {
        e.preventDefault();
        socket.emit('like post', id);
        return false;
    }

    // socket.io emit function
    const handleFollow = async (e, id) => {
        e.preventDefault();
        socket.emit('follow user', id);
        return false;
    }

    // if there are no messages display nothing
    if (messages.length === 0) {
        return (
            <div>
            </div>
        );
    }

    // for each message format the appropriate html
    const messageList = messages.map(message => {
        return (
            <div key={message._id}>
                <hr></hr>
                <h3>{message.username}: <p>{message.content}</p></h3>
                <p>{message.likeCount} Likes</p>
                {/* clicking this button fires off the like event in socket */}
                <button type='submit' onClick={(e) => handleLike(e, message._id)}>Like</button>
                {/* 1. follow button is only displayed if the post is not from the user */}
                {/* 2. follow button text changes based on if the user follows the poster */}
                {!message.isOwnPost &&
                    <button type='submit' onClick={(e) => handleFollow(e, message._id)}>
                        {message.isFollowed ? 'Unfollow' : 'Follow'}
                    </button>
                }
            </div>
        )
    });

    // display it on the page when called
    return (
        <div>
            {messageList}
        </div>
    )
}

// method that contacts the server about a user 
// changing their password
const changePass = (e) => {
    e.preventDefault();

    // checks to see if the data is valid
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

// react component that has fields for letting 
// users change their password
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

// does a bunch of things on window load
const init = async () => {
    const changePassButton = document.getElementById('changePassButton');
    const main = document.getElementById('mainScreenButton');
    const premiumBtn = document.getElementById('activatePremium');

    // sets up displaying the change pass form when 
    // the appropriate button is clicked
    changePassButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<ChangePassWindow />,
            document.getElementById('MessageForm'));
        document.querySelector('#messages').style.display = 'none';
        return false;
    });

    // sets up displaying the main app form when 
    // the appropriate button is clicked
    main.addEventListener('click', e => {
        e.preventDefault();
        ReactDOM.render(<MessageForm />,
            document.getElementById('MessageForm'));
        document.querySelector('#messages').style.display = 'block';
        return false;
    })

    // changes the premium status of the user
    // when the appropriate button is clicked
    premiumBtn.addEventListener('click', async e => {
        const response = await fetch('/setPremium', { method: 'post' });
    })

    // renders out the message sending box and its features
    ReactDOM.render(
        <MessageForm />,
        document.getElementById('MessageForm')
    );

     // renders out the post board and its features
    ReactDOM.render(
        <MessageContainer messages={[]} />,
        document.getElementById('messages')
    );
}

window.onload = init;