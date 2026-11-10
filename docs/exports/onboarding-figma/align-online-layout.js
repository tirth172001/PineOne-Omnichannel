// Run after compose-flow.js: online screens share the In-store SetupFrame layout.
const migrated=[];
for(const record of RECORDS){
 const f=await figma.getNodeByIdAsync(record.nodeId);
 const success=record.id==='submitted';
 const stepIndex=success?11:({'pan-fetched':0,'pan-otp':0,'pan-verified':0,'gst-manual':1,'bank-cheque':4,'owners-list':5,'owner-sheet':5,'identity-otp':8,'video-session':9,'agreement-accepted':11}[record.id]??STEPS.findIndex(s=>s.id===record.id));
 const oldHeader=f.children.find(n=>n.name==='Header');
 const breadcrumb=f.children.find(n=>n.name==='Breadcrumb');
 const oldCard=f.children.find(n=>n.name==='Onboarding workspace');
 let rail=oldCard.children.find(n=>n.name==='Onboarding progress');
 const content=oldCard.children.find(n=>n.name==='Content');
 f.layoutMode='HORIZONTAL';f.itemSpacing=8;f.paddingLeft=f.paddingRight=f.paddingTop=f.paddingBottom=8;fill(f,'#f5f5f5');
 if(!rail){rail=box(null,'Onboarding progress','VERTICAL',256,f.height-16,null,12,16);for(const name of ['About business','Business verification','KYC','Review and sign agreement']){const r=box(rail,name,'HORIZONTAL',224,40,null,8,8);svg(r,'71132a51cf5fe33c9adbce9f43c5ff5d56db8aa0.svg');text(r,name,14,'Medium','ink',180);}const spring=box(rail,'Flexible space','VERTICAL',1,1);spring.layoutSizingVertical='FILL';const keys=box(rail,'Get API keys','HORIZONTAL',224,32,null,8,8);svg(keys,'a33e5b78850ec624d1228c9d730f0eb2faed48b0.svg');text(keys,'Get API keys',12,'Medium');}
 f.insertChild(0,rail);f.insertChild(1,content);
 rail.resize(256,f.height-16);rail.fills=[];rail.strokes=[];rail.paddingLeft=rail.paddingRight=16;
 const heading=box(null,'Product context','VERTICAL',224,null,null,8);
 svg(heading,'logo-mark',63,48);vspace(heading,24);text(heading,'Setting up',12,'Medium','muted');text(heading,'Checkout',16,'Semi Bold');text(heading,`Step ${STEPS[stepIndex].macro+1} of 4`,12,'Regular','muted');vspace(heading,12);rail.insertChild(0,heading);
 for(const row of rail.children){if(row===heading||row.name==='Flexible space')continue;if(row.type==='FRAME'&&row.width>224){row.resize(224,row.height);for(const t of row.children.filter(n=>n.type==='TEXT')){const width=row.paddingLeft>=30?160:row.name==='Progress section'?172:200;t.textAutoResize='HEIGHT';t.resize(width,t.height);}const textHeight=Math.max(0,...row.children.filter(n=>n.type==='TEXT').map(t=>t.height));if(textHeight+16>row.height)row.resize(224,textHeight+16);}}
 const saved=box(rail,'Saved progress note','VERTICAL',224,null,null,8);text(saved,'Your progress is saved. You can leave and pick up from the Overview any time.',12,'Regular','muted',224);
 content.resize(1160,f.height-16);content.cornerRadius=8;fill(content,'white');content.clipsContent=true;
 const h=box(null,'Setup header','HORIZONTAL',1160,64,null,16,24);text(h,'Checkout setup',14,'Medium');spacer(h);button(h,'Save and exit','overview-resume','Ghost');content.insertChild(0,h);
 const main=content.children.find(n=>n.name==='Main');const existing=[...main.children];
 main.resize(1160,f.height-148);main.layoutSizingVertical='FILL';main.paddingLeft=main.paddingRight=40;main.paddingTop=main.paddingBottom=48;main.counterAxisAlignItems='CENTER';main.clipsContent=true;main.overflowDirection='VERTICAL';
 const wide=success||[1,3,9,10,11].includes(stepIndex);const colWidth=wide?1000:560;const col=box(main,'Onboarding form column','VERTICAL',colWidth,null,null,0);for(const child of existing)col.appendChild(child);
 const directTexts=col.children.filter(n=>n.type==='TEXT');for(const t of directTexts){if(success)continue;t.textAutoResize='HEIGHT';t.resize(colWidth,t.height);if(t.fontSize===16){t.fontSize=14;t.lineHeight={unit:'PIXELS',value:24};}}
 const form=col.children.find(n=>n.name==='Form');if(form){form.resize(colWidth,form.height);form.primaryAxisSizingMode='AUTO';if(stepIndex===9){for(const row of form.children.filter(n=>n.name==='Preparation illustrations')){row.resize(1000,row.height);for(const figure of row.children){figure.resize(478,figure.height);for(const image of figure.children.filter(n=>n.type==='RECTANGLE'&&n.fills.some(p=>p.type==='IMAGE')))image.resize(478,269);for(const caption of figure.children.filter(n=>n.type==='TEXT'))caption.resize(478,caption.height);}}const available=form.children.find(n=>n.name==='Video KYC availability');available.resize(1000,available.height);}}
 let foot=content.children.find(n=>n.name==='Action bar');if(!foot)foot=box(content,'Action bar','HORIZONTAL',1160,68,'white',12,24);else{foot.resize(1160,68);foot.paddingLeft=foot.paddingRight=24;foot.itemSpacing=12;const existingButtons=foot.children.filter(n=>n.type==='INSTANCE');const spring=foot.children.find(n=>n.name==='Flexible space');for(let i=0;i<existingButtons.length;i++)foot.insertChild(i,existingButtons[i]);if(spring)foot.appendChild(spring);const back=existingButtons.find(n=>n.name==='Previous');if(back){back.setProperties({'Button Text#37:10':'Back'});fontsOf(back);back.name='Back';}}
 if(stepIndex===9&&!success)button(foot,'Back','identity','Outline');if(!foot.children.some(n=>n.name==='Flexible space'))spacer(foot);button(foot,'Ask for support',null,'Ghost');
 const removed=[oldHeader.id,breadcrumb.id,oldCard.id];oldHeader.remove();breadcrumb.remove();oldCard.remove();
 migrated.push({id:record.id,nodeId:f.id,wide,stepIndex,removedNodeIds:removed,mutatedNodeIds:[f.id,rail.id,content.id,main.id,foot.id,...existing.map(n=>n.id)]});
}
return {migrated,actions,createdNodeIds:[...new Set(allCreated)]};
