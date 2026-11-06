"""Package the latest portable game and a Japanese quick-start guide."""
import json
from pathlib import Path
import subprocess
import zipfile
root = Path(__file__).resolve().parent.parent
destinations = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {TRIP_DESTINATIONS} from './src/destinations.js'; console.log(JSON.stringify(Object.values(TRIP_DESTINATIONS)));"], cwd=root, text=True))
out = root / 'downloads'
out.mkdir(exist_ok=True)
names = '・'.join(d['name'] for d in destinations)
hotels = 3 + sum(len(d['hotels']) for d in destinations)
guide = f'''KOMOREBI 遊び方

ZIPを展開し、KOMOREBI.htmlを Chrome / Edge / Safari 等のブラウザーで開いてください。
インストールや外部アセットのダウンロードは不要です。WebGL対応が必要です。
同じブラウザーに自動保存します。次回は「つづきから」で再開できます。

画面ドラッグ：見回す　WASD：歩く　Shift：走る　E：調べる・体験の次の操作
タッチ端末：画面の方向ボタン・ドラッグ・調べるボタン
I：持ちもの　M：地図　J：旅行予約　B：街の案内　H：土地・家・家具
P：今日の予定　L：天気・自転車・傘・体験時間　Esc：休憩

追加した旅先：{names}
宿は嵐山の3軒と追加の宿を合わせて{hotels}軒です。

Jで行き先を選択し、日帰りの往復券か、往復交通＋宿を予約します。
宿だけ先に予約していても、Jの「往復列車の予約」から交通だけ追加できます。
東京駅へ出かけ、道案内に従って乗車口まで歩いてE、行き先を選んで乗車します。
通常の6号車の乗車口でも、箱根などの予約した行き先を選べます。
乗車券は駅の券売機でも購入できます。未来のDAYの券は、その日から乗れます。
旅先の駅・カフェ・売店・撮影場所・スタンプ・宿はすべて道でつながっています。
Mの地図で位置を確認できます。宿は入口でE、フロントでチェックインします。
宿から出ると入った入口へ戻ります。帰りはチェックアウト後、駅に歩いてE。
お財布からの支払いで、予約済みの交通・宿を二重請求しません。未使用分はJで取消可能です。

旅先のカフェは7:00〜21:00、ランチは¥700。Eまたは体験カードで一口ずつ食べます。
宿の夕食18:00〜21:00、翌朝食7:00〜10:00。食事別の宿は別料金です。
お風呂は洗い場へ歩き、洗う・流す・湯船へ歩く・つかる・拭くを順に進めます。
未完了の体験は途中から再開でき、リロード後は中断状態で復元します。

追加した街・観光路線・宿はゲーム用の表現です。実際の経路や料金とは異なります。
花伝抄デラックスツインの内装は資料照合待ちで、現在は仮内装です。
'''
(out / '遊び方.txt').write_text(guide, encoding='utf-8')
html = root / 'dist' / 'KOMOREBI.html'
assert html.is_file(), 'Run npm run build:portable first.'
archive = out / 'KOMOREBI.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(html, 'KOMOREBI.html')
    z.write(out / '遊び方.txt', '遊び方.txt')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert z.read('KOMOREBI.html') == html.read_bytes()
print(f'Packaged {len(destinations)} new destinations / {hotels} hotels: {archive} ({archive.stat().st_size:,} bytes)')
