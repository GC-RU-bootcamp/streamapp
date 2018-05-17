$(document).ready(function () {
  // Getting references to our form and inputs
  var loginForm = $("form.login");
  var logonInput = $("input#logon-input");
  var passwordInput = $("input#password-input");
  
  // When the form is submitted, we validate there's an email and password entered
  loginForm.on("submit", function (event) {
    event.preventDefault();
    console.log(logonInput.val());
    var userData = {
      logon_id:  logonInput.val().trim(),
      logon_pwd: passwordInput.val().trim()
    };

    if (!userData.logon_id || !userData.logon_pwd) {
      return;
    }

    // If we have an email and password we run the loginUser function and clear the form
    loginUser(userData.logon_id, userData.logon_pwd);
    logonInput.val('');
    passwordInput.val('');
  });

  // loginUser does a post to our "api/login" route and if successful, redirects us the the members page
  function loginUser(logon_id, logon_pwd) {
    $.post("/api/login", {
      logon_id: logon_id,
      logon_pwd: logon_pwd
    }).then(function (data) {
      window.location.replace(data);
      // If there's an error, log the error
    }).catch(function (err) {
      console.log(err);
    });
  }

});