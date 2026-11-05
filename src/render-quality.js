// Preserve detail on a GPU while keeping software rendering and large displays usable.
export function configureQuality(renderer){
 const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
 const device=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'';
 const software=/swiftshader|llvmpipe|softpipe|software/i.test(device);
 let base=1,scale=1,slow=0,fast=0;
 function resize(){base=Math.min(devicePixelRatio,1.7,Math.sqrt((software?360000:2200000)/(innerWidth*innerHeight)));renderer.setPixelRatio(base*scale);}
 function update(ms){
  if(ms>80&&ms<1500){slow++;fast=0;}else if(ms>0&&ms<24){fast++;slow=0;}else{slow=0;fast=0;}
  if(slow>=12&&scale>.6){scale=Math.max(.6,scale*.8);slow=0;renderer.setPixelRatio(base*scale);}
  if(fast>=180&&scale<1){scale=Math.min(1,scale*1.1);fast=0;renderer.setPixelRatio(base*scale);}
 }
 resize();return {resize,update};
}
