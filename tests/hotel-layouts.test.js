import {test} from 'node:test';import assert from 'node:assert/strict';
import {HOTEL_LAYOUTS} from '../src/hotel-layouts.js';
import {newLife,validSave,loadLife} from '../src/life.js';
import {freshTravel} from '../src/travel.js';
import {beginRoutine,routineInput,advanceRoutine,routineTarget} from '../src/routines.js';
for(const [id,l]of Object.entries(HOTEL_LAYOUTS))test(id+': bathing follows this room and survives a save',()=>{const s={...newLife(),minutes:600,travel:{...freshTravel(),region:'room',hotelId:id,stay:{checkInDay:1,rested:false,dinnerDay:0}}};s.position=[...l.wash.slice(0,1),1.65,l.wash[1]];assert.ok(beginRoutine(s,'hotelBath'));assert.deepEqual(routineTarget(s.routines.active),l.wash);assert.ok(validSave(s));const r=loadLife({getItem:()=>JSON.stringify(s)});assert.equal(r.routines.active.hotelId,id);const step=()=>{assert.ok(routineInput(s));advanceRoutine(s,s.routines.active.remaining);};step();step();step();step();assert.deepEqual(routineTarget(s.routines.active),l.bath);s.position=[l.bath[0],1.65,l.bath[1]];step();step();assert.equal(s.routines.active,null);assert.equal(s.routines.baths,1);});
