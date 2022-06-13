var rgbled;
var led;
var irrecv;
var irrawsend;
var Chat;
var myData;
var val;

function get_time(t) {
  var varTime = new Date(),
    varHours = varTime.getHours(),
    varMinutes = varTime.getMinutes(),
    varSeconds = varTime.getSeconds();
  var varNow;
  if (t == "hms") {
    varNow = varHours + ":" + varMinutes + ":" + varSeconds;
  } else if (t == "h") {
    varNow = varHours;
  } else if (t == "m") {
    varNow = varMinutes;
  } else if (t == "s") {
    varNow = varSeconds;
  }
  return varNow;
}


boardReady({board: 'Smart', device: 'AwXLa', transport: 'mqtt', multi: true}, function (board) {
  board.samplingInterval = 50;
  rgbled = getRGBLedCathode(board, 15, 12, 13);
  led = getLed(board, 12);
  irrecv = getIrRawRecv(board, 2);
  irrawsend = getIrRawSend(board, 5);
  Chat = new Firebase('https://webduino-chat-363a7-default-rtdb.firebaseio.com/');
  myData= {};
  myData.sheetUrl = 'https://docs.google.com/spreadsheets/d/1xNnyrAyFdRfHI-27UUKyPnHdBSueGWwoESg-QZ6FUIY/edit#gid=2143217410';
  myData.sheetName = '工作表1';
  Chat.limitToLast(1).on('child_added', function (snapshot) {
    val = snapshot.val().content;
    if (val == '遙控器設定') {
      readSheetData({
        row : 3,
        col : 2,
        sheetUrl : myData.sheetUrl,
        sheetName : myData.sheetName
      }, function(googleSheetReadData){
        if (!(googleSheetReadData?googleSheetReadData:[]).length) {
          Chat.push({
            name: 'System',
            userid: 'LED',
            time: get_time("hms"),
            content: '開始設定'
          });
          Chat.push({
            name: 'System',
            userid: 'LED',
            time: get_time("hms"),
            content: '請按下電源鍵'
          });
          irrecv.receive(function(val){
            irrecv.onVal = val;
            myData.column0 = '電源';
            myData.column1 = irrecv.onVal;
            writeSheetData(myData);
            Chat.push({
              name: 'System',
              userid: 'LED',
              time: get_time("hms"),
              content: '請按下風量鍵'
            });
            irrecv.receive(function(val){
              irrecv.onVal = val;
              myData.column0 = '風量';
              myData.column1 = irrecv.onVal;
              writeSheetData(myData);
              Chat.push({
                name: 'System',
                userid: 'LED',
                time: get_time("hms"),
                content: '請按下風量鍵'
              });
              irrecv.receive(function(val){
                irrecv.onVal = val;
                myData.column0 = '擺頭';
                myData.column1 = irrecv.onVal;
                writeSheetData(myData);
                irrecv.stopRecv();
              });
            });
          });
        }
      });
    } else if (val == '開燈') {
      Chat.push({
        name: 'System',
        userid: 'LED',
        time: get_time("hms"),
        content: '燈開瞜！'
      });
      led.on();
    } else if (val == '關燈') {
      Chat.push({
        name: 'System',
        userid: 'LED',
        time: get_time("hms"),
        content: '燈關瞜！'
      });
      led.off();
    } else if (val == '開電扇') {
      Chat.push({
        name: 'System',
        userid: 'LED',
        time: get_time("hms"),
        content: '電扇開了！'
      });
      readSheetData({
        row : 1,
        col : 2,
        sheetUrl : myData.sheetUrl,
        sheetName : myData.sheetName
      }, function(googleSheetReadData){
        irrawsend.send(googleSheetReadData,
          function(){});
      });
    } else if (val == '關電扇') {
      Chat.push({
        name: 'System',
        userid: 'LED',
        time: get_time("hms"),
        content: '幫你關電扇了！'
      });
      readSheetData({
        row : 1,
        col : 2,
        sheetUrl : myData.sheetUrl,
        sheetName : myData.sheetName
      }, function(googleSheetReadData){
        irrawsend.send(googleSheetReadData,
          function(){});
      });
    } else if (val == '風量') {
      Chat.push({
        name: 'System',
        userid: 'LED',
        time: get_time("hms"),
        content: '調整風量！'
      });
      readSheetData({
        row : 2,
        col : 2,
        sheetUrl : myData.sheetUrl,
        sheetName : myData.sheetName
      }, function(googleSheetReadData){
        irrawsend.send(googleSheetReadData,
          function(){});
      });
    } else if (val == '擺頭') {
      readSheetData({
        row : 3,
        col : 2,
        sheetUrl : myData.sheetUrl,
        sheetName : myData.sheetName
      }, function(googleSheetReadData){
        irrawsend.send(googleSheetReadData,
          function(){});
      });
      Chat.push({
        name: 'System',
        userid: 'LED',
        time: get_time("hms"),
        content: '調整擺頭'
      });
    }
  });
});
