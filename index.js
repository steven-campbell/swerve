var swerve = document.getElementById("swerve");
var sContext = swerve.getContext("2d");

var wheelbase;
var trackwidth;

var translational = document.getElementById("translational");
var tContext = translational.getContext("2d");
var joyX;
var joyY;

var rotational;

var gyroAngle;
var isFieldOriented;

$("#wheelbase").change(function() {
  fixCanvasRatio();
  swerveDrive();
});

$("#trackwidth").change(function() {
  fixCanvasRatio();
  swerveDrive();
});

$("#translational").click(function(e) {
  var x = e.clientX - this.getBoundingClientRect().left;
  var y = e.clientY - this.getBoundingClientRect().top;

  joyX = (x - 50) / 50;
  joyY = (50 - y) / 50;
  var joyMagnitude = Math.sqrt(Math.pow(joyX, 2) + Math.pow(joyY, 2));

  if (joyMagnitude <= 1) {
    translationalRedraw();
    tContext.fillStyle = "blue";
    tContext.beginPath();
    tContext.arc(x, y, 3, 0, 2 * Math.PI, true);
    tContext.fill();
    $("#transVector").text("<" + joyX + ", " + joyY + "> " + joyMagnitude.toFixed(3));
    swerveDrive();
  } else {
    alert("invalid joystick point: click inside the circle");
  }

});

$("#rotational").change(function() {
  rotational = this.value;
  swerveDrive();
});

$("#gyro").change(function() {
  gyroAngle = this.value;
  swerveDrive();
});

$("#gyroreset").click(function() {
  gyroAngle = 0;
  $("#gyro").val("0");
  swerveDrive();
});

$("#fieldOrient").click(function() {
  isFieldOriented = this.checked;
  swerveDrive();
})

function onInitialization() {
  swerveInit();
  translationalRedraw();
}

function swerveInit() {
  sContext.fillStyle = "black";
  sContext.font = "14pt Calibri";
  sContext.textAlign = "center"
  sContext.fillText("Wheels will appear after", swerve.width / 2, swerve.height / 2 - 10.5);
  sContext.fillText("modifying wb and tw", swerve.width / 2, swerve.height / 2 + 10.5);
}

function translationalRedraw() {
  tContext.clearRect(0, 0, 100, 100);
  tContext.beginPath();
  tContext.moveTo(50, 0);
  tContext.lineTo(50, 100);
  tContext.stroke();
  tContext.beginPath();
  tContext.moveTo(0, 50);
  tContext.lineTo(100, 50);
  tContext.stroke();
  tContext.beginPath();
  tContext.arc(50, 50, 50, 0, 2 * Math.PI, true);
  tContext.stroke();
}

function fixCanvasRatio() {
  sContext.clearRect(0, 0, 200, 240);
  wheelbase = $("#wheelbase").val();
  trackwidth = $("#trackwidth").val();
  // makes one dimension reach the max pixels allowed
  var ratio = wheelbase / trackwidth;
  // max pixels on trackwidth is 170: 200 - 10 - 10 - 5 - 5
  // max pixels on wheelbase is 170: 240 - 10 - 10 - 25 - 25
  var trackwidthPixels = 170;
  var wheelbasePixels = trackwidthPixels * ratio;
  if (wheelbasePixels > 170) {
    wheelbasePixels = 170;
    trackwidthPixels = wheelbasePixels / ratio;
  }
  sContext.fillRect(10, 10, 10, 50);
  sContext.fillRect(10 + trackwidthPixels, 10, 10, 50);
  sContext.fillRect(10, 10 + wheelbasePixels, 10, 50);
  sContext.fillRect(10 + trackwidthPixels, 10 + wheelbasePixels, 10, 50);
}

function swerveDrive() {
  var results = getWheelVectors(joyX, joyY, rotational, gyroAngle, wheelbase, trackwidth, isFieldOriented);
  if (!(results == -1)) {
    $("#ws1").text(results[0].toFixed(4));
    $("#ws2").text(results[1].toFixed(4));
    $("#ws3").text(results[2].toFixed(4));
    $("#ws4").text(results[3].toFixed(4));
    $("#wa1").text(results[4].toFixed(4));
    $("#wa2").text(results[5].toFixed(4));
    $("#wa3").text(results[6].toFixed(4));
    $("#wa4").text(results[7].toFixed(4));
  }
}

function getWheelVectors(x, y, omega, gyro, l, w, isFieldOriented) {
  if (typeof(x) == "undefined" || typeof(y) == "undefined" || typeof(omega) == "undefined" || typeof(gyro) == "undefined" || typeof(l) == "undefined" || typeof(w) == "undefined" || typeof(isFieldOriented) == "undefined") return -1;
  // logic credit to Chief Delphi user Ether
  var fwd = y;
  var str = x;
  var rcw = omega;
  var temp;
  var r = Math.sqrt(Math.pow(l, 2) + Math.pow(w, 2));
  if (isFieldOriented) {
    temp = fwd * Math.cos(toRad(gyro)) + str * Math.sin(toRad(gyro));
    str = -fwd * Math.sin(toRad(gyro)) + str * Math.cos(toRad(gyro));
    fwd = temp;
  }
  var a = str - rcw * l / r;
  var b = str + rcw * l / r;
  var c = fwd - rcw * w / r;
  var d = fwd + rcw * w / r;

  var ws1 = Math.sqrt(Math.pow(b, 2) + Math.pow(c, 2));
  var ws2 = Math.sqrt(Math.pow(b, 2) + Math.pow(d, 2));
  var ws3 = Math.sqrt(Math.pow(a, 2) + Math.pow(d, 2));
  var ws4 = Math.sqrt(Math.pow(a, 2) + Math.pow(c, 2));

  var wa1 = Math.atan2(b, c) * 180 / Math.PI;
  var wa2 = Math.atan2(b, d) * 180 / Math.PI;
  var wa3 = Math.atan2(a, d) * 180 / Math.PI;
  var wa4 = Math.atan2(a, c) * 180 / Math.PI;

  var max = ws1;
  if (ws2 > max) max = ws2;
  if (ws3 > max) max = ws3;
  if (ws3 > max) max = ws4;
  if (max > 1) {
    ws1 /= max;
    ws2 /= max;
    ws3 /= max;
    ws4 /= max;
  }
  return [ws1, ws2, ws3, ws4, wa1, wa2, wa3, wa4];
}

function toRad(deg) {
  return deg * Math.PI / 180;
}

function toDeg(rad) {
  return rad * 180 / Math.PI;
}

onInitialization();
