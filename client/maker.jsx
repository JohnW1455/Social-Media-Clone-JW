const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const color = e.target.querySelector('#domoColor').value;

    if (!name || !age || !color) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, color}, loadDomosFromServer);

    return false;
}

const DomoForm = (props) => {
    return (
        <form id="domoForm"
            onSubmit={handleDomo}
            name="domoForm"
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="color">Color: </label>
            <input id="domoColor" type="text" name="name" placeholder="Domo Color" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="number" name="age" min="0" />
            <input className="makeDomoSubmit" type="submit" value="Make Domo"/>
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
    helper.hideError();

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

const init = () => { 
    const changePassButton = document.getElementById('changePassButton');
    const makeDomosButton = document.getElementById('makeDomosButton');

    changePassButton.addEventListener('click', (e) => {
        e.preventDefault();
        ReactDOM.render(<ChangePassWindow />,
            document.getElementById('domos'));
        return false;
    });

    makeDomosButton.addEventListener('click', (e) => {
        e.preventDefault();
        loadDomosFromServer();
        return false;
    });

    ReactDOM.render(
        <DomoForm />,
        document.getElementById('makeDomo')
    );

    ReactDOM.render(
        <DomoList domos={[]} />,
        document.getElementById('domos')
    )

    loadDomosFromServer();
}

window.onload = init;