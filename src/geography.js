export const LAYOUT_VERSION=2;
export const LAYOUT={
 cafe:{x:-28,z:-4,minX:-9,maxX:9,minZ:-10,maxZ:10,entry:[-28,8]},
 library:{x:28,z:-4,minX:-11,maxX:11,minZ:-12,maxZ:12,entry:[28,8]},
 garden:{x:-64,z:-3,minX:-17,maxX:17,minZ:-15,maxZ:15,entry:[-64,12]},
 waterfront:{x:78,z:-40,minX:-28,maxX:28,minZ:-18,maxZ:23,entry:[78,-20]},
 hill:{x:-85,z:-58,minX:-21,maxX:21,minZ:-19,maxZ:18,entry:[-85,-41]},
};
export const CITY_BOUNDS={minX:-118,maxX:118,minZ:-108,maxZ:94};
export const DESTINATIONS={bathhouse:{name:'こもれび湯',point:[-90,25]},home:{name:'アパート',point:[0,9]},cafe:{name:'森のカフェ',point:LAYOUT.cafe.entry},library:{name:'図書館',point:LAYOUT.library.entry},garden:{name:'市民農園',point:LAYOUT.garden.entry},waterfront:{name:'水辺の遊歩道',point:LAYOUT.waterfront.entry},hill:{name:'見晴らしの丘',point:LAYOUT.hill.entry},market:{name:'マーケット',point:[14,24]},furniture:{name:'家具店',point:[-55,24]},estate:{name:'住まい相談所',point:[55,24]},residential:{name:'住宅地',point:[0,51]},park:{name:'こもれび公園',point:[-28,26]}};
export const isLocalRegion=id=>id==='home'||id==='residential'||Object.hasOwn(LAYOUT,id);
export function areaAt(x,z){for(const[id,a]of Object.entries(LAYOUT))if(x>=a.x+a.minX&&x<=a.x+a.maxX&&z>=a.z+a.minZ&&z<=a.z+a.maxZ)return id;return z>=48&&z<=82&&Math.abs(x)<=48?'residential':'home';}
export function migrateLayout(s){if(s.worldLayout===LAYOUT_VERSION)return false;const a=LAYOUT[s.travel?.region];if(a){s.position[0]+=a.x;s.position[2]+=a.z;}s.worldLayout=LAYOUT_VERSION;return true;}
