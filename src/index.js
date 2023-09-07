import $ from 'jquery'
import {saveToExportPrivate,insertRegisteredListToPrivate, addProfile, saveUserInfo, addProfileRegistered, currentUser, loadProfileByToken, saveToExport, loadRegisteredUserList, token, logout, addSuccessLabel2, addErrorLabel2, logoutGuest, addSuccessLabel, addErrorLabel, login, createUser, loginAsGuest, loadUserList } from './rest';
import {messages,sendPlainMessagePrivate, openConnection, sendPlainMessage, stompClient } from './sockets';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';




$(() => {


  if (sessionStorage.getItem("token") == null) {
    document.getElementById("send-btn").disabled = true;
    document.getElementById("export-btn").disabled = true;
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("privateChat").style.display = "none";
    document.getElementById("toPrivateChat").style.display = "none";

  }
 
  if (sessionStorage.getItem("currentUser") == null && sessionStorage.getItem("nickName") != null) {
    document.getElementById("privateChat").style.display = "none";
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("profileSection").innerHTML = "";
    addProfile();
    disableSignin();
    addSuccessLabel("Connected!");
    document.getElementById("send-btn").disabled = false;
    document.getElementById("export-btn").disabled = false;
    document.getElementById("toPrivateChat").style.display = "none";

  }
   
  if (sessionStorage.getItem("currentUser") != null) {
    document.getElementById("privateChat").style.display = "none";
    document.getElementById("profilePage").style.display = "none";
    document.getElementById("profileSection").innerHTML = "";
    addProfileRegistered(JSON.parse(sessionStorage.getItem("currentUser")));
    disableSignin();
    addSuccessLabel("Connected!");
    document.getElementById("send-btn").disabled = false;
    document.getElementById("export-btn").disabled = false;
    document.getElementById("toPrivateChat").style.display = "block";
  }


  let token = sessionStorage.getItem("token");

  var myVar
  function showList() {
    loadUserList();
    myVar = setTimeout(showList, 10000);
  }
  function stopFunction() {
    clearTimeout(myVar);  
  }
  $(document).ready(function () {
    showList();
  });



  $("#signinBtnGuest").on('click', () => {
    let user = {
      nickName: $('#userInput').val()
    }

    if ($('#userInput').val() == '')
      addErrorLabel("Please Enter Nickname First.");
    else {
      loginAsGuest(user);
    }


  })

  $("#send-btn").on("click", () => {
    console.log(sessionStorage.getItem("nickName"), $('#message-input').val());
    sendPlainMessage(sessionStorage.getItem("nickName"), $('#message-input').val())
  })

  $("#sendPrivate-btn").on("click", () => {
    sendPlainMessagePrivate(sessionStorage.getItem("nickName"), $('#messagePrivate-input').val(),sessionStorage.getItem("currentChatId"))
  })

  $("#exportPrivate-btn").on("click", () => {
    saveToExportPrivate();
  })

  $("#export-btn").on("click", () => {
    saveToExport();
  })
})

function disableSignin() {

  document.getElementById("emailInput").disabled = true;
  document.getElementById("passwordInput").disabled = true;
  document.getElementById("signinBtn").disabled = true;
  document.getElementById("userInput").disabled = true;
  document.getElementById("signinBtnGuest").disabled = true;
  document.getElementById("toRegister").style.visibility = 'hidden';
}


function disableSignup() {
  document.getElementById("emailInputReg").disabled = true;
  document.getElementById("passwordInputReg").disabled = true;
  document.getElementById("userInputReg").disabled = true;
  document.getElementById("registerWithEmail").disabled = true;
}

let user;
$(() => {
  $("#signinBtn").on('click', () => {
    user = {
      email: $('#emailInput').val(),
      password: $('#passwordInput').val()
    }
    if ($('#emailInput').val() == '')
      addErrorLabel2("Please Enter Email First.");
    else if ($('#passwordInput').val() == '') {
      addErrorLabel2("Please Enter Password First.");
    }
    else {
      login(user);
    }
  })
})

let user2;

$(() => {
  $("#registerWithEmail").on('click', () => {
    user2 = {
      email: $('#emailInputReg').val(),
      nickName: $('#userInputReg').val(),
      password: $('#passwordInputReg').val()
    }
    createUser(user2);
  })
})


$(document).ready(function () {
  $(document).on("click", "#logoutG", function () {
    logoutGuest($('#userInput').val());
  })
});

$(document).ready(function () {
  $(document).on("click", "#logout", function () {
    logout(sessionStorage.getItem("token"));
  })
});

if (sessionStorage.getItem("token") != null) {
  addProfileRegistered(sessionStorage.getItem("token"));
}

$(document).ready(function () {
  $(document).on("click", "#profile", function () {
    document.getElementById("mainPage").style.display = "none";
    document.getElementById("profilePage").style.display = "flex";
    document.getElementById("successLbl3").innerHTML = "";
    document.getElementById("errorLbl3").innerHTML = "";


    var image = document.getElementById('output').disabled = false;
    document.getElementById("image_input").disabled = false;
    document.getElementById("saveProfile").style.visibility = "visible";
    document.getElementById("statuses").disabled = false;


    document.getElementById("pro-nickName").disabled = false;
    document.getElementById("pro-firstName").disabled = false;
    document.getElementById("pro-lastName").disabled = false;
    document.getElementById("pro-email").disabled = false;
    document.getElementById("pro-birthday").disabled = false;
    document.getElementById("pro-desc").disabled = false;
    document.getElementById("pro-age").disabled = false;

    document.getElementById("isPublic").disabled = false;
    document.getElementById("isPrivate").disabled = false;

    loadProfileByToken(JSON.parse(sessionStorage.getItem("currentUser")));
  })
});

$(document).ready(function () {
  $(document).on("change", "#pro-birthday", function () {
    var today = new Date();
    var birthDate = new Date(document.getElementById("pro-birthday").value);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    document.getElementById("pro-age").value = age;
    console.log(age);
  });
});


$(document).ready(function () {
  $(document).on("click", "#cancelProfile", function () {
    document.getElementById("mainPage").style.display = "block";
    document.getElementById("profilePage").style.display = "none";
  });
});

$(document).ready(function () {
  $(document).on("click", "#saveProfile", function () {
    var mycurrentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    console.log("currentUser");
    console.log(mycurrentUser);



    mycurrentUser.nickName = document.getElementById("pro-nickName").value;
    mycurrentUser.firstName = document.getElementById("pro-firstName").value;
    mycurrentUser.lastName = document.getElementById("pro-lastName").value;
    mycurrentUser.birthDate = document.getElementById("pro-birthday").value;
    mycurrentUser.description = document.getElementById("pro-desc").value;
    mycurrentUser.age = document.getElementById("pro-age").value;
    mycurrentUser.imgUrl = document.getElementById('output').src;
    mycurrentUser.status = document.getElementById("statuses").value;
    if (document.getElementById("isPublic").checked)
      mycurrentUser.private = false;
    else
      mycurrentUser.private = true;
    sessionStorage.removeItem("currentUser");
    sessionStorage.setItem("currentUser", JSON.stringify(mycurrentUser));
    sessionStorage.removeItem("nickName");
    sessionStorage.setItem("nickName", mycurrentUser.nickName);

    console.log(mycurrentUser);
    saveUserInfo(mycurrentUser);
  });
});

$(document).ready(function () {
  $(document).on("click", "#toPrivateChat", function () {
    document.getElementById("mainChatRoom").style.display = "none";
    document.getElementById("privateChat").style.display = "block";
    let messages=[];
  });
});

$(document).ready(function () {
  $(document).on("click", "#toMainChatRoom", function () {
    document.getElementById("mainChatRoom").style.display = "block";
    document.getElementById("privateChat").style.display = "none";
    let messages=[];
  });
});

openConnection();
export { disableSignin, disableSignup }