import { serverAddress } from "./constants"
import {getMessageHistory, onMessageReceivedPrivate, stompClient, messages } from './sockets';
import { disableSignin, disableSignup } from './index';
import { saveAs } from "file-saver";
import axios from 'axios';

let token;
let currentUser;

const login = (user) => {

  fetch(serverAddress + "/auth/login", {
    method: 'POST',
    body: JSON.stringify({ email: user.email, password: user.password }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
    }
  }).then((res => {
    let data = res.json();
    console.log(data);
    data.then(async function (result) {
      let msg = result.message;
      if (msg == null) {
        let res = await axios.get(serverAddress + "/user/userByToken?token=" + result);
        sessionStorage.setItem("currentUser", JSON.stringify(res.data));

        if (res.data.isMuted) {
          document.getElementById("send-btn").disabled = true;
          document.getElementById("export-btn").disabled = true;

        } else {
          document.getElementById("send-btn").disabled = false;
          document.getElementById("export-btn").disabled = false;
        }
        currentUser = res.data;
        sessionStorage.setItem("nickName", res.data.nickName);
        addSuccessLabel2("Connected!");

        disableSignin();

        sessionStorage.setItem("token", result);
        addProfileRegistered(currentUser);
        document.getElementById("toPrivateChat").style.display = "block";
        stompClient.send("/app/hello", [],
          JSON.stringify({ name: " " + sessionStorage.getItem("nickName") + " has " })
        )
      }
      else
        addErrorLabel2(msg);
    });
  }))
}


function saveToExport() {
  const fs = require('fs');

  let data = "";

  for (let i = 0; i < messages.length; i++) {
    data += messages[i].sender + ": " + messages[i].content;
    data += '\n';
  }
  saveChatToFile(data, "MainChat.txt");
}

function saveToExportPrivate() {
  const fs = require('fs');

  let data = "";

  for (let i = 0; i < messages.length; i++) {
    data += messages[i].sender + ": " + messages[i].content;
    data += '\n';
  }
  saveChatToFile(data, "PrivateChat.txt");
}



function saveChatToFile(data, filename) {
  var blob = new Blob([data],
    { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename);
}

function getUserByToken(token) {
  token = sessionStorage.getItem("token")

  fetch(serverAddress + "/user/userByToken", {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
    }
  }).then((res => {
    let data = res.json();
    data.then(function (result) {
      console.log("am in brooooo");
      let msg = result.message;
      console.log("result : ", result);
      sessionStorage.setItem("currentUser", result);
  
    });
  }))
}


function loadProfileByToken(currentUser) {
  console.log("loadProfileByToken");
  console.log(currentUser);

  const image_input = document.querySelector('#image_input')
  var uploaded_image = "";

  image_input.addEventListener('change', function () {

    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);

  })

  var image = document.getElementById('output');
  image.src = currentUser.imgUrl;

  document.getElementById("statuses").value = currentUser.status;
  document.getElementById("pro-nickName").value = currentUser.nickName;
  document.getElementById("pro-firstName").value = currentUser.firstName;
  document.getElementById("pro-lastName").value = currentUser.lastName;
  document.getElementById("pro-email").value = currentUser.email;
  document.getElementById("pro-email").disabled = true;
  document.getElementById("pro-birthday").value = currentUser.birthDate;
  document.getElementById("pro-desc").value = currentUser.description;
  document.getElementById("pro-age").value = currentUser.age;
  if (currentUser.private) {
    document.getElementById("isPublic").checked = false;
    document.getElementById("isPrivate").checked = true;
  }
  else {
    document.getElementById("isPublic").checked = true;
    document.getElementById("isPrivate").checked = false;
  }
}

const loginAsGuest = (user) => {
  fetch(serverAddress + "/auth/loginGuest", {
    method: 'POST',
    body: JSON.stringify({ nickName: user.nickName }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
    }
  }).then((res => {
    let data = res.json();
    data.then(function (result) {
      let msg = result.message;
      if (msg == null) {
        sessionStorage.setItem("nickName", "Guest-" + user.nickName);
        sessionStorage.setItem("token", result);
        stompClient.send("/app/hello", [],
          JSON.stringify({ name: sessionStorage.getItem("nickName") + " has " })
        )
        addProfile();
        disableSignin();
        addSuccessLabel("Connected!");
        document.getElementById("send-btn").disabled = false;
        document.getElementById("export-btn").disabled = false;
        document.getElementById("toPrivateChat").style.display = "none";

      }
      else
        addErrorLabel(msg);
    });
  }))
}


function addErrorLabel(msg) {
  let label = document.getElementById("errorLbl");
  label.innerHTML = `${msg}`
}

function addSuccessLabel(msg) {
  let label = document.getElementById("successLbl");
  label.innerHTML = `${msg}`
  addErrorLabel("");
}

function addErrorLabel2(msg) {
  let label = document.getElementById("errorLbl2");
  label.innerHTML = `${msg}`
}

function addSuccessLabel2(msg) {
  let label = document.getElementById("successLbl2");
  label.innerHTML = `${msg}`
  addErrorLabel2("");
}

function addErrorLabel3(msg) {
  let label = document.getElementById("errorLbl3");
  label.innerHTML = `${msg}`
}

function addSuccessLabel3(msg) {
  let label = document.getElementById("successLbl3");
  label.innerHTML = `${msg}`
  addErrorLabel3("");
}


function addProfile() {

  let profile = document.getElementById("profileSection");

  profile.insertAdjacentHTML('afterbegin',
    `      
  <div class="thumb">
    <img width="40px" radius="50%" height="40px" class="img-fluid" src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="">
  </div>
    <h5 class="mb-0" id="currentUserName">${sessionStorage.getItem("nickName")}</h5>
    <a class="mb-0" id="logoutG">Logout</a>
    `
  )
}

function addProfileRegistered(currentUser) {
  console.log("addProfileRegistered");
  console.log(currentUser);
  let image = currentUser.imgUrl;
  let profile = document.getElementById("profileSection");
  profile.innerHTML = '';
  profile.insertAdjacentHTML('afterbegin',
    ` 
    <div>     
        <div class="thumb">
          <img width="40px" radius="50%" height="40px" class="img-fluid" src=${image} alt="">
        </div>
          <h5 class="mb-0" id="currentUserName">${currentUser.nickName}</h5>
          <h7 class="mb-0"><button class="btn btn-link" id="profile" >View Profile</button></h7></br>
          <button class="btn btn-link" class="mb-0" id="logout">Logout</button>
    </div>
    `)
}


function logout(token) {
  token = sessionStorage.getItem("token")
  fetch(serverAddress + "/auth/logout", {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
    }
  }).then((res => {
    sessionStorage.clear();
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("profileSection").innerHTML = "";
    location.reload(true);
  }))
}


function logoutGuest(Nickname) {
  token = sessionStorage.getItem("token")
  fetch(serverAddress + "/auth/logoutGuest", {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
    }
  }).then((res => {

    console.log("from logoutGuset : ", res);
    sessionStorage.clear();
    location.reload(true);
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("profileSection").innerHTML = "";

  }))
}



function saveUserInfo(user) {
  console.log(user);

  fetch(serverAddress + "/user/saveProfile", {
    method: 'POST',
    body: JSON.stringify({
      nickName: user.nickName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
      age: user.age,
      description: user.description,
      status: user.status,
      imgUrl: user.imgUrl,
      private: user.private,
      isPrivate: user.private
    }),
    headers: {
      'Content-Type': 'application/json',
    }
  }).then((res => {
    let data = res.json();
    data.then(function (result) {
      let msg = result.message;
      if (msg == undefined) {
        addSuccessLabel3(result);
        alert("Profile Changed Successfully!");
        document.getElementById("mainPage").style.display = "block";
        document.getElementById("profilePage").style.display = "none";
        addProfileRegistered(JSON.parse(sessionStorage.getItem("currentUser")));
      }
      else
        addErrorLabel3(msg);
    });
  }))
}


const createUser = (user) => {
  console.log(user);
  fetch(serverAddress + "/auth/signup", {
    method: 'POST',
    body: JSON.stringify({ nickName: user.nickName, email: user.email, password: user.password }),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
    }
  }).then((res => {
    let data = res.json();
    data.then(function (result) {
      let msg = result.message;
      if (msg == undefined) {
        addSuccessLabel(result);
        disableSignup();
      }
      else
        addErrorLabel(msg);
    });
  }))
}

async function loadUserList() {

  let response = await fetch(serverAddress + "/user/onlineGuestUsers");

  let listofUsers = [];
  let data = response.json();
  data.then(function (result) {
    listofUsers = result;
    insertList(listofUsers);
    loadRegisteredUserList();
  });
}

async function loadRegisteredUserList() {

  let response = await fetch(serverAddress + "/user/onlineUsers");

  let listofUsers = [];
  let data = response.json();
  data.then(function (result) {
    listofUsers = result;
    insertRegisteredList(listofUsers);
    insertRegisteredListToPrivate(listofUsers);
  });
}

function insertRegisteredListToPrivate(users) {

  let table = document.getElementById("registered-list");
  var tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = "";
  users.forEach(element => {
    let image = element.imgUrl;
    console.log(element);
    tbody.insertRow(0).innerHTML =
      `
    <td class="title" width="60%">
      <div class="thumb">
        <img width="40px" radius="50%" height="40px" class="img-fluid" src=${image} alt="">
      </div>
      <div class="candidate-list-details">
        <div class="candidate-list-info">

      <div class="candidate-list-title">
     
        <h5 class="mb-0"><button id=${element.nickName} onClick="getUserById(${element.id})" class="chatwith btn btn-link"> ${element.nickName}  ${element.role == 1 ? "<span>*</span>" : " <span></span>"}</button></h5>
      
        <button  id=${element.id} class="chatnow">Chat Now!</button>
      </div>

      </div>
      </div>
    </td>

    <td class="status">
      <ul>
        ${element.status}
      </ul>
    </td>
    `
    $(".chatnow").each(function (index) {
      
      $(this).on("click", function () {
        let id = $(this).attr('id');
        let chatId
        var currentUserId = JSON.parse(sessionStorage.getItem("currentUser")).id;
        if (id < currentUserId)
          chatId = id + "A" + currentUserId;
        else
          chatId = currentUserId + "A" + id;
        sessionStorage.removeItem("currentChatId");
        sessionStorage.setItem("currentChatId", chatId);
        stompClient.unsubscribe("myTopicId");
        stompClient.subscribe('/user/' + sessionStorage.getItem("currentChatId") + '/private', onMessageReceivedPrivate, { id: "myTopicId" });

        fetch("http://localhost:8080/user/userById", {
          method: 'POST',
          body: JSON.stringify({ token: id }),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
          }
        }).then((res => {
          let data = res.json();
          data.then(function (result) {
            console.log(result);
            let nickName = result.nickName; 
            document.getElementById("chatWith").textContent = "Chat with "+nickName;
          });
        }))

       
        getMessageHistory(sessionStorage.getItem("currentChatId"), '#private-chat');
      })
    });
  });

}











function insertRegisteredList(users) {

  let table = document.getElementById("candidates-list");
  var tbody = table.getElementsByTagName('tbody')[0];

  users.forEach(element => {
    if (element.isMuted && element.nickName == sessionStorage.getItem("nickName")) {
      document.getElementById("mutelbl").textContent = "(*) You Are Muted By The Admin!";
    }
    if (!element.isMuted && element.nickName == sessionStorage.getItem("nickName")) {
      document.getElementById("mutelbl").textContent = "";
    }
    let image = element.imgUrl;
    console.log(element);
    tbody.insertRow(0).innerHTML =
      `
    <td class="title" width="60%">
      <div class="thumb">
        <img width="40px" radius="50%" height="40px" class="img-fluid" src=${image} alt="">
      </div>
      <div class="candidate-list-details">
        <div class="candidate-list-info">

      <div class="candidate-list-title">
     
        <h5 class="mb-0"><button onClick="getUserById(${element.id})" class="btn btn-link"> ${element.nickName}  ${element.role == 1 ? "<span>*</span>" : " <span></span>"}</button></h5>
        ${element.isMuted == true ? ` <h6 id=${element.id} class="mute mb-0">unmute</h6> ` :
        ` <h6  id=${element.id} class="mute mb-0">mute</h6>`}
      </div>

      </div>
      </div>
    </td>

    <td class="status">
      <ul>
        ${element.status}
      </ul>
    </td>
    `

    $(".mute").each(function (index) {
      $(this).on("click", function () {
        let id = $(this).attr('id');
        let token = sessionStorage.getItem("token");

        if (document.getElementById(id).innerText == 'mute') {

          fetch(serverAddress + "/admin/mute?id=" + id, {
            method: 'PUT',
            body: JSON.stringify({ token }),
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
            }
          }).then((res => {
            console.log(res);
            if (res.status == 200) {
              document.getElementById(id).innerText = 'unmute';
              console.log("hi2");

            } else {
              alert("only admins can mute/unmute");
              document.getElementById("send-btn").disabled = false;
              document.getElementById("export-btn").disabled = false;
            }

          }))

        } else {

          fetch(serverAddress + "/admin/unmute?id=" + id, {
            method: 'PUT',
            body: JSON.stringify({ token }),
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
            }
          }).then((res => {
            console.log(res);
            if (res.status == 200) {
              document.getElementById(id).innerText = 'mute';
              document.getElementById("send-btn").disabled = false;
              document.getElementById("export-btn").disabled = false;

            } else {
              alert("only admins can mute/unmute");
              document.getElementById("send-btn").disabled = true;
              document.getElementById("export-btn").disabled = true;



            }

          }))
        }
      })

    });
  });
}


function insertList(users) {

  let table = document.getElementById("candidates-list");
  var tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = "";
  console.log(users);
  users.forEach(element => {
    if (element.muted && "Guest-" + element.nickName == sessionStorage.getItem("nickName")) {
      document.getElementById("mutelbl").textContent = "(*) You Are Muted By The Admin!";
    }
    if (!element.muted && "Guest-" + element.nickName == sessionStorage.getItem("nickName")) {
      document.getElementById("mutelbl").textContent = "";
    }


    tbody.insertRow(-1).innerHTML =
      `
    <td class="title" width="60%">
      <div class="thumb">
        <img width="40px" radius="50%" height="40px" class="img-fluid" src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="">
      </div>
      <div class="candidate-list-details">
        <div class="candidate-list-info">
          <div class="candidate-list-title">
            <h5  class="mb-0"><a href="#">Guest-${element.nickName}</a></h5>
            ${element.muted == true ? ` <p  class="guest" id=${element.nickName} class="mb-0">unmute</p> ` :
        ` <p class="guest" id=${element.nickName} class="mb-0">mute</p>`
      }
          
            </div>
        </div>
      </div>
    </td>

    <td class="status">
      <ul>
        Online
      </ul>
    </td>
    `;

    $(".guest").each(function (index) {
      $(this).on("click", function () {
        let nickName = $(this).attr('id');
        let token = sessionStorage.getItem("token");

        if (document.getElementById(nickName).innerText == 'mute') {

          fetch(serverAddress + "/admin/muteGuest?nickName=" + nickName, {
            method: 'PUT',
            body: JSON.stringify({ token }),
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
            }
          }).then((res => {
            console.log("res");
            console.log(res);
            if (res.status == 200) {
              document.getElementById(nickName).innerText = 'unmute';
              console.log("here 2");

            } else {
              alert("only admins can mute/unmute");
              document.getElementById("send-btn").disabled = false;
              document.getElementById("export-btn").disabled = false;
            }

          }))

        } else {

          fetch(serverAddress + "/admin/unmuteGuest?nickName=" + nickName, {
            method: 'PUT',
            body: JSON.stringify({ token }),
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST,PATCH,OPTIONS'
            }
          }).then((res => {
            console.log(res);
            if (res.status == 200) {
              document.getElementById(nickName).innerText = 'mute';
              document.getElementById("send-btn").disabled = false;
              document.getElementById("export-btn").disabled = false;
            } else {
              alert("only admins can mute/unmute");
              document.getElementById("send-btn").disabled = true;
              document.getElementById("export-btn").disabled = true;

            }

          }))
        }
      })

    });

  });
}





export {saveToExportPrivate, insertRegisteredListToPrivate, saveUserInfo, addProfile, addProfileRegistered, currentUser, loadProfileByToken, getUserByToken, saveToExport, loadRegisteredUserList, token, logout, addErrorLabel2, addSuccessLabel2, logoutGuest, addSuccessLabel, createUser, login, loginAsGuest, loadUserList, addErrorLabel }