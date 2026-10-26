/** Small ink illustrations for the physical label, rather than stock product imagery. */
export function drawSpiceEngraving(ctx,kind,x,y,scale=1,ink='#292820'){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.lineWidth=3.25;ctx.strokeStyle=ink;
  if(kind==='anise'){
    for(let i=0;i<8;i++){
      ctx.save();ctx.rotate(i*Math.PI/4);
      ctx.beginPath();ctx.moveTo(8,0);ctx.bezierCurveTo(27,-27,70,-22,101,0);ctx.bezierCurveTo(70,25,28,29,8,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(18,0);ctx.bezierCurveTo(39,-15,67,-13,87,0);ctx.bezierCurveTo(65,15,39,16,18,0);ctx.stroke();
      ctx.beginPath();ctx.ellipse(52,0,19,6,0,0,Math.PI*2);ctx.stroke();
      for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(23+j*11,-7-j%2*3);ctx.lineTo(30+j*11,-14-j%2*3);ctx.stroke();}
      ctx.restore();
    }
  }else if(kind==='cinnamon'){
    for(let i=0;i<3;i++){
      ctx.save();ctx.translate(-45+i*18,-22+i*30);ctx.rotate(i===1?-.55:.32);
      ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(170,-13);ctx.quadraticCurveTo(189,0,170,13);ctx.lineTo(0,13);ctx.stroke();
      ctx.beginPath();ctx.ellipse(0,0,14,13,0,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();for(let t=0;t<Math.PI*4;t+=.15){const r=11-t*.65;ctx.lineTo(Math.cos(t)*r,Math.sin(t)*r);}ctx.stroke();
      for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(17+j*4,-8+j*4);ctx.lineTo(159-j*5,-7+j*4);ctx.stroke();}
      ctx.restore();
    }
  }
  ctx.restore();
}
