import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newLife,validSave,loadLife} from '../src/life.js';
import {TRIP_DESTINATIONS} from '../src/destinations.js';
import {ensureTravel,visit,reserveHotel,reserveRailTicket,bookPackage,bookExcursion,cancelExcursion,rideExcursion,enterRegionHotel,checkIn,checkOut,leaveRegionHotel} from '../src/travel.js';
const resident=()=>{const s=newLife();s.money=100000;ensureTravel(s);return s;};
for(const d of Object.values(TRIP_DESTINATIONS)){
 test(`${d.id}: hotel-only reservation accepts later rail tickets and a prepaid return without changing the hotel`,()=>{
  const s=resident(),h=d.hotels[0];assert.equal(reserveHotel(s,h.id,1),true);const reservation=structuredClone(s.travel.reservation);s.travel.plan={kind:'overnight',day:1,hotelId:h.id};const plan=structuredClone(s.travel.plan);
  assert.equal(bookExcursion(s,d.id,1),true);assert.deepEqual(s.travel.reservation,reservation);assert.deepEqual(s.travel.plan,plan);assert.equal(s.travel.hotelId,h.id);assert.equal(s.money,100000-h.price-2*d.fare);assert.equal(bookExcursion(s,d.id,1),false);
  visit(s,'tokyo');s.position=[0,1.65,-10];assert.equal(rideExcursion(s),false);s.position=[4.2,1.65,4.6];assert.equal(rideExcursion(s),true);assert.equal(s.travel.region,d.id);assert.ok(validSave(s));const restored=loadLife({getItem:()=>JSON.stringify(s)});assert.deepEqual(restored.travel.reservation,reservation);
  restored.position=[-18,1.65,9];assert.equal(enterRegionHotel(restored,h.id),true);assert.equal(checkIn(restored),true);assert.equal(checkOut(restored),true);leaveRegionHotel(restored);restored.position=[0,1.65,19];assert.equal(rideExcursion(restored),true);assert.equal(restored.travel.region,'tokyo');assert.equal(restored.travel.excursion,null);assert.equal(restored.money,100000-h.price-2*d.fare);
 });
 test(`${d.id}: an existing package can board at the normal platform, with no new fare`,()=>{const s=resident();assert.equal(bookPackage(s,'overnight',d.hotels[1].id,1),true);const money=s.money;visit(s,'tokyo');s.position=[4.2,1.65,4.6];assert.equal(rideExcursion(s),true);assert.equal(s.travel.region,d.id);assert.equal(s.money,money);});
}
test('rail-only booking preserves an already purchased Kyoto ticket and refunds only its own fare',()=>{const s=resident();reserveHotel(s,'hakone_lake',1);reserveRailTicket(s,1);const before=structuredClone(s);assert.equal(bookExcursion(s,'hakone',1),true);assert.equal(s.travel.ticket,'kyoto');assert.equal(cancelExcursion(s),true);assert.deepEqual(s,before);assert.equal(cancelExcursion(s),false);});
test('rail-only tickets reject invalid dates and insufficient money; future departures cannot board early',()=>{const s=resident();reserveHotel(s,'hakone_lake',2);const before=structuredClone(s);for(const [dest,day]of [['missing',1],['hakone',0],['hakone',32],['hakone',NaN]])assert.equal(bookExcursion(s,dest,day),false);assert.deepEqual(s,before);s.money=4399;assert.equal(bookExcursion(s,'hakone',1),false);s.money=4400;assert.equal(bookExcursion(s,'hakone',2),true);visit(s,'tokyo');s.position=[4.2,1.65,4.6];assert.equal(rideExcursion(s),false);assert.equal(s.travel.excursion.outbound,true);s.day=2;assert.equal(rideExcursion(s),true);assert.equal(s.money,0);});
