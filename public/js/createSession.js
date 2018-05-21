function notNullCheck() {
  if (document.getElementById('null').checked) {
      document.getElementById('min-col').style.visibility = 'visible';
      document.getElementById('max-col').style.visibility = 'visible';
      document.getElementById('minimum').disabled = false;
      document.getElementById('maximum').disabled = false;
  } else {
      document.getElementById('min-col').style.visibility = 'hidden';
      document.getElementById('max-col').style.visibility = 'hidden';
      document.getElementById('minimum').disabled = true;
      document.getElementById('maximum').disabled = true;
  }
}

document.getElementById("null").onclick = function() {
  notNullCheck();
};
document.getElementById("not-null").onclick = function() {
  notNullCheck();
};

document.getElementById('submit').addEventListener('click',function(){
  console.log('I was clicked');
  var newSession = {
    name: document.getElementById('name').value,
    description: document.getElementById('description').value,
    item_date: document.getElementById('date').value + ' ' + document.getElementById('time').value,
    cost: document.getElementById('cost').value,
    min_attendees: document.getElementById('minimum').value,
    max_attendees: document.getElementById('maximum').value
  }

  $.post('api/host/create-session',newSession);
})