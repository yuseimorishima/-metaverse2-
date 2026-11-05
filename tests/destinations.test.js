import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newLife,validSave,loadLife} from '../src/life.js';
import {TRIP_DESTINATIONS} from '../src/destinations.js';
import {HOTELS,ensureTravel,visit,bookPackage,cancelExcursion,cancelHotel,rideExcursion,enterRegionHotel,leaveRegionHotel,checkIn,checkOut,enterRoom,sleepAtHotel,rememberDestination,reserveHotel} from '../src/travel.js';
import {beginRoutine,routineAvailability} from '../src/routines.js';
const resident=()=>{const s=newLife();s.money=100000;ensureTravel(s);return s;};
for(const d of Object.values(TRIP_DESTINATIONS)){
 test(`${d.id}: prepaid round trip, dated check-in, real hotel exit and reload preserve money and possessions`,()=>{
  const s=resident(),h=d.hotels[0],total=d.fare*2+h.price;s.minutes=480;
  assert.equal(bookPackage(s,'overnight',h.id,2),true);assert.equal(s.money,100000-total);
  visit(s,'tokyo');s.position=[-3.7,1.65,14];assert.equal(rideExcursion(s),false);s.day=2;s.position=[10,1.65,0];assert.equal(rideExcursion(s),false);
  s.position=[-3.7,1.65,14];assert.equal(rideExcursion(s),true);assert.equal(s.travel.region,d.id);assert.equal(s.money,100000-total);
  s.position=[-18,1.65,8.5];s.yaw=.4;assert.equal(enterRegionHotel(s,h.id),true);assert.equal(checkIn(s),true);assert.equal(s.money,100000-total);assert.equal(enterRoom(s),true);
  assert.equal(validSave(s),true);const restored=loadLife({getItem:()=>JSON.stringify(s)});assert.equal(restored.travel.hotelId,h.id);assert.equal(sleepAtHotel(restored),true);visit(restored,'hotel');assert.equal(checkOut(restored),true);assert.equal(leaveRegionHotel(restored),true);assert.deepEqual(restored.position,[-18,1.65,8.5]);assert.equal(restored.yaw,.4);assert.ok(restored.travel.memories.includes(d.id+':stay:2'));
  restored.position=[0,1.65,19];assert.equal(rideExcursion(restored),true);assert.equal(restored.travel.region,'tokyo');assert.equal(restored.travel.excursion,null);assert.equal(restored.money,100000-total);assert.equal(restored.inventory.bread,2);assert.ok(validSave(restored));
 });
 test(`${d.id}: unused components refund once; a consumed outward ticket never refunds`,()=>{
  const s=resident(),h=d.hotels[1];bookPackage(s,'overnight',h.id,1);assert.equal(cancelExcursion(s),true);assert.equal(cancelExcursion(s),false);assert.equal(cancelHotel(s),true);assert.equal(s.money,100000);
  bookPackage(s,'daytrip',h.id,1);visit(s,'tokyo');s.position=[-3.7,1.65,14];rideExcursion(s);assert.equal(cancelExcursion(s),true);assert.equal(s.money,100000-d.fare);s.position=[0,1.65,19];assert.equal(rideExcursion(s),true);assert.equal(s.money,100000-2*d.fare);
 });
 test(`${d.id}: sightseeing records and a paid timed meal survive saves`,()=>{
  const s=resident();visit(s,d.id);assert.equal(rememberDestination(s,'stamp'),true);assert.equal(rememberDestination(s,'stamp'),false);assert.equal(rememberDestination(s,'photo'),true);s.position=[8,1.65,5.7];s.minutes=600;
  assert.equal(beginRoutine(s,'tripMeal'),true);assert.equal(s.money,99300);assert.equal(s.routines.active.done,0);assert.equal(validSave(s),true);assert.ok(loadLife({getItem:()=>JSON.stringify(s)}));s.minutes=1300;assert.equal(routineAvailability(s,'tripMeal').ok,false);
  assert.equal(Object.values(HOTELS).filter(h=>h.destination===d.id).length,2);
 });
}
test('old version-2 saves load without new trip fields and malformed route data is rejected',()=>{const s=resident();delete s.travel.excursion;delete s.travel.memories;delete s.travel.hotelReturn;assert.ok(validSave(s));ensureTravel(s);assert.deepEqual(s.travel.memories,[]);s.travel.excursion={destination:'missing',day:1,outbound:true,return:true};assert.equal(validSave(s),false);});

test('changing hotels requires leaving the actual lobby first',()=>{for(const d of Object.values(TRIP_DESTINATIONS)){const s=resident(),[a,b]=d.hotels;visit(s,d.id);s.position=[-18,1.65,8];assert.equal(enterRegionHotel(s,a.id),true);assert.equal(reserveHotel(s,b.id,1),false);assert.equal(s.travel.hotelId,a.id);assert.equal(s.money,100000);assert.equal(leaveRegionHotel(s),true);s.position=[18,1.65,8];assert.equal(enterRegionHotel(s,b.id),true);assert.equal(reserveHotel(s,b.id,1),true);assert.equal(checkIn(s),true);assert.equal(s.money,100000-b.price);assert.ok(validSave(s));}});
