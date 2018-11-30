function myFunction() {
  // HTMLのデータを取得する
  var url = 'https://qiita.com';
  var response = UrlFetchApp.fetch(url);
  var html = response.getContentText('UTF-8');

  // 取得したHTMLを通知用のテキストに加工する
  var lines = html.split('>');    // １行のテキストとして返ってくるので閉じタグで分割する
  var rank_line = lines.filter(isRankLine);    // ランキングデータが入ってる行のみを返す
  var rank_json = getRankJson(rank_line[0]);    // ランキングデータの行をjson形式に変換する
  var message = createMessage(rank_json['trend']['edges']);    // json形式のデータを通知用のテキストに変換する

  // jsonを加工してチャットワークに通知する
  notifyChatwork(message);
}

function isRankLine(line) {
  if (line.match(/data\-hyperapp\-app\=\"Trend\"/)) {
    return line;
  }
}

function getRankJson(line) {
  line = line.replace(/&quot;/g, '"');
  var start = line.indexOf('{"trend"');
  var end  = line.indexOf('}}}]}}') + '}}}]}}'.length;
  var data = line.substring(start, end);
  return JSON.parse(data);
}

function createMessage(json){
  message = '';

  json.forEach(function (data) {
    var author = data['node']['author']['urlName'];
    var uuid = data['node']['uuid'];
    var title = data['node']['title'];
    var url = 'https://qiita.com/' + author + '/items/' + uuid;
    var likes = data['node']['likesCount'];

    message += title + '\n';
    message += url + '\n';
    message += likes + 'いいね\n\n';
  });
  return message;
}

function notifyChatwork(message) {
  var client = ChatWorkClient.factory({token: 'your api token'});
  client.sendMessage({room_id: 'your room id', body: message});
}