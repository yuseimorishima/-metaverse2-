const room=(name,theme,w,d,bed,tea,bath,extras)=>({name,theme,w,d,bed,tea,bath,wash:[bath[0]-2.5,bath[1]+1.5],extras});
export const HOTEL_LAYOUTS={
 machiya:room('小さな町家の寝室','machiya',15,17,[-4,-2],[3,2],[4,-6],'desk'),
 komorebi:room('畳と読書の和室','japanese',22,22,[-5,-5],[3,1],[7,-9],'library'),
 kamakura_guest:room('海辺のコンパクトツイン','coastal',16,17,[-4,-2],[4,3],[5,-6],'surf'),
 kamakura_terrace:room('テラス付きシーサイドルーム','coastal',24,23,[5,-6],[-5,-1],[-7,-10],'terrace'),
 hakone_lake:room('湖畔のウッドロッジ','lodge',24,24,[-6,-6],[4,0],[8,-11],'fireplace'),
 hakone_suite:room('湖畔の温泉スイート','spa',32,30,[-9,-10],[6,1],[11,-16],'suite'),
 nikko_lodge:room('森のキャビン','lodge',22,23,[5,-6],[-5,0],[-7,-10],'fireplace'),
 nikko_retreat:room('木立のプライベートスイート','forest',30,29,[8,-10],[-6,0],[-10,-15],'suite'),
 nara_guest:room('町家の格子と坪庭','machiya',17,19,[4,-3],[-4,2],[-5,-8],'garden'),
 nara_garden:room('庭に向いた和洋室','japanese',25,25,[-6,-8],[5,-1],[8,-12],'garden'),
 osaka_stay:room('街歩きのワークルーム','urban',17,18,[-4,-3],[4,1],[5,-7],'desk'),
 osaka_sky:room('街明かりのスカイスイート','city',34,29,[9,-10],[-7,1],[-11,-15],'suite'),
 kobe_harbor:room('港のクラシックツイン','nautical',25,24,[6,-7],[-5,-1],[-8,-11],'piano'),
 kobe_ocean:room('海辺のパノラマスイート','ocean',34,31,[-10,-11],[7,0],[12,-17],'suite'),
};
export const roomLayout=id=>HOTEL_LAYOUTS[id]||null;
