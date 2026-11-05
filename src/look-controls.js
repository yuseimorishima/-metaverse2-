// Shared mouse/touch drag controls. UI buttons never capture the camera.
export function bindDragLook(canvas, {isActive,onLook,onDrag=()=>{}}) {
 let pointer=null,lastX=0,lastY=0;
 function end(){const id=pointer;pointer=null;onDrag(false);if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}
 const down=e=>{if(!isActive()||pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(pointer);onDrag(true);};
 const move=e=>{if(e.pointerId!==pointer)return;if(!isActive()){end();return;}e.preventDefault();onLook(e.clientX-lastX,e.clientY-lastY);lastX=e.clientX;lastY=e.clientY;};
 const up=e=>{if(e.pointerId===pointer)end();};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);
 return {cancel:end,dispose(){end();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('lostpointercapture',up);}};
}
