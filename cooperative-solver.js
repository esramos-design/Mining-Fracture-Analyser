/**
 * MFA Cooperative Fleet Solver
 * Alternative support plans using the existing deterministic MFA mechanics.
 */
(function () {
    var ORDER = ["mole", "prospector", "golem"];
    var LABEL = { mole:"ARGO MOLE", prospector:"MISC Prospector", golem:"Drake Golem" };
    function el(id){ return document.getElementById(id); }
    function n(v,d){ var x=Number(v); return Number.isFinite(x)?x:(d||0); }
    function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

    function prefs(){
        return window.MFAOps && MFAOps.getPreferences ? MFAOps.getPreferences() : {
            optimizerObjective:"minimum-ships", maxFleetSize:6, allowActiveModules:true,
            allowGadgets:true, fleetAvailableMole:1, fleetAvailableProspector:2, fleetAvailableGolem:1
        };
    }

    function deployedCounts(){
        var arms={mole:0,prospector:0,golem:0}, out={};
        document.querySelectorAll(".ship-arm-card").forEach(function(card){
            if(Object.prototype.hasOwnProperty.call(arms,card.dataset.ship)) arms[card.dataset.ship]++;
        });
        ORDER.forEach(function(id){
            var ship=ships.find(function(s){return s.id===id;});
            out[id]=arms[id]?Math.ceil(arms[id]/Math.max(1,ship?ship.arms:1)):0;
        });
        return out;
    }

    function currentArms(){
        var out=[];
        document.querySelectorAll(".ship-arm-card").forEach(function(card){
            var enabled=el(card.id+"-enable");
            if(!enabled || !enabled.checked) return;
            var ls=el(card.id+"-laser");
            if(!ls || ls.selectedIndex<0) return;
            var opt=ls.options[ls.selectedIndex], modules=[];
            for(var i=1;i<=3;i++){
                var ms=el(card.id+"-mod"+i);
                if(!ms || ms.disabled || ms.value==="None") continue;
                var m=powerModules.find(function(x){return x.name===ms.value;});
                var toggle=el(card.id+"-mod"+i+"-active-toggle");
                if(m && (m.activation!=="Active" || (toggle && toggle.checked))) modules.push(m.name);
            }
            out.push({
                shipId:card.dataset.ship||"unknown", role:"Current",
                laser:(opt.textContent||"Current").split("(")[0].trim(),
                basePower:n(ls.value), resistanceEffect:n(opt.dataset.resistance),
                instabilityEffect:n(opt.dataset.instability), modules:modules
            });
        });
        return out;
    }

    function armMetrics(a){
        var power=n(a.basePower), res=1+n(a.resistanceEffect)/100, inst=1+n(a.instabilityEffect)/100, active=0;
        (a.modules||[]).forEach(function(name){
            var m=powerModules.find(function(x){return x.name===name;});
            if(!m) return;
            power*=n(m.multiplier,1); res*=1+n(m.resistanceEffect)/100; inst*=1+n(m.instabilityEffect)/100;
            if(m.activation==="Active") active++;
        });
        return {power:power,res:res,inst:inst,active:active};
    }

    function evaluate(baseRes,baseInst,mass,arms,gadgetName){
        if(!arms.length) return {success:false,power:0,required:Infinity,finalResistance:baseRes,finalInstability:baseInst,marginPct:-Infinity,activeModules:0};
        var power=0,resProd=1,instProd=1,active=0;
        arms.forEach(function(a){var m=armMetrics(a);power+=m.power;resProd*=m.res;instProd*=m.inst;active+=m.active;});
        var resMult=Math.pow(resProd,1/arms.length), instMult=Math.pow(instProd,1/arms.length);
        var g=gadgets.find(function(x){return x.name===gadgetName;});
        if(g){resMult*=1+n(g.reduction!=null?g.reduction:g.resistance)/100;instMult*=1+n(g.instabilityEffect)/100;}
        var finalRes=Math.max(0,baseRes*resMult), finalInst=Math.max(0,baseInst*instMult);
        var required=finalRes<100?mass*(1-finalRes/100)/5:Infinity;
        var success=Number.isFinite(required)&&required>0&&power>=required;
        var margin=Number.isFinite(required)&&required>0?(power-required)/required*100:-Infinity;
        return {success:success,power:power,required:required,finalResistance:finalRes,finalInstability:finalInst,marginPct:margin,activeModules:active};
    }

    function strategy(s){
        if(s.baseInstability>70) return {
            name:"Hazard / Instability",
            mole:[["Break","Lancet MH2",["Focus III","Focus III"]],["Stab","Lancet MH2",["Focus III","Focus III"]],["Extr","Impact II",["Torrent III","Torrent III","FLTR-XL"]]],
            prospector:[["Stab","Lancet MH1",["Focus III"]]], golem:[["Support","Pitman",["Focus III","Focus III"]]]
        };
        if(s.baseResistance>60 || s.deficit>0) return {
            name:"Resistance Breaker",
            mole:[["Break","Helix II",["Surge","Rieger-C3","Rieger-C3"]],["Stab","Lancet MH2",["Brandt","Focus III"]],["Extr","Impact II",["Torrent III","Torrent III","FLTR-XL"]]],
            prospector:[["Break","Helix I",["Surge","Rieger-C3"]]], golem:[["Break","Pitman",["Surge","Rieger-C3"]]]
        };
        if(s.baseInstability>45) return {
            name:"Stabilization",
            mole:[["Break","Helix II",["Focus III","Focus III","Focus III"]],["Stab","Lancet MH2",["Focus III","Focus III"]],["Extr","Impact II",["Torrent III","FLTR-XL"]]],
            prospector:[["Stab","Hofstede-S1",["Focus III"]]], golem:[["Stab","Pitman",["Focus III","Rieger-C3"]]]
        };
        if(s.mass>14000) return {
            name:"Heavy Cluster",
            mole:[["Break","Impact II",["Surge","Torrent III","Torrent III"]],["Stab","Lancet MH2",["Focus III","Focus III"]],["Extr","Impact II",["Torrent III","Torrent III","FLTR-XL"]]],
            prospector:[["Break","Impact I",["Torrent III","FLTR-XL"]]], golem:[["Break","Pitman",["Torrent III","Torrent III"]]]
        };
        return {
            name:"Standard",
            mole:[["Break","Helix II",["Rieger-C3","Rieger-C3"]],["Stab","Arbor MH2",["Focus III","Focus III"]],["Extr","Arbor MH2",["Torrent III","FLTR-XL"]]],
            prospector:[["General","Arbor MH1",["FLTR-XL"]]], golem:[["General","Pitman",["FLTR-XL"]]]
        };
    }

    function eligibleLasers(id){
        return allLaserHeads.filter(function(h){
            if(id==="golem") return h.name.indexOf("Pitman")>=0;
            if(id==="prospector") return h.size===1 && h.name.indexOf("Pitman")<0;
            return id==="mole" && h.size===2;
        });
    }

    function scoreLaser(h,role,s){
        var p=n(h.power),r=n(h.resistanceEffect),i=n(h.instabilityEffect);
        if(role==="Stab"||s.baseInstability>45) return (-i*85)+p+(-r*20);
        if(role==="Break"||s.baseResistance>55||s.deficit>0) return (-r*95)+p+(-i*15);
        if(role==="Extr") return n(h.extractionLaserPower)*1.3+p*.5+(-i*10);
        return p+(-r*55)+(-i*15);
    }

    function moduleDistance(a,b){
        return Math.abs((n(a.multiplier,1)-n(b.multiplier,1))*100)+Math.abs(n(a.resistanceEffect)-n(b.resistanceEffect))+
            Math.abs(n(a.instabilityEffect)-n(b.instabilityEffect))+Math.abs(n(a.windowEffect)-n(b.windowEffect))*.35+
            (a.activation===b.activation?0:18);
    }

    function altModule(name,rank,allowActive){
        var src=powerModules.find(function(m){return m.name===name;});
        if(!src) return name;
        var list=powerModules.filter(function(m){return m.name!=="None"&&m.name!==name&&(allowActive||m.activation!=="Active");})
            .sort(function(a,b){return moduleDistance(src,a)-moduleDistance(src,b);});
        return list[Math.min(rank,list.length-1)]?list[Math.min(rank,list.length-1)].name:name;
    }

    function makeVariant(id,template,p,s,rank){
        return template.map(function(row){
            var role=row[0], laserName=row[1], mods=row[2].slice();
            if(rank>0 && id!=="golem"){
                var list=eligibleLasers(id).slice().sort(function(a,b){return scoreLaser(b,role,s)-scoreLaser(a,role,s);});
                list=list.filter(function(h){return h.name!==laserName;});
                if(list[rank-1]) laserName=list[rank-1].name;
                mods=mods.map(function(x){return altModule(x,rank-1,p.allowActiveModules);});
            }
            if(!p.allowActiveModules){
                mods=mods.map(function(x){
                    var m=powerModules.find(function(mm){return mm.name===x;});
                    return m&&m.activation==="Active"?altModule(x,0,false):x;
                });
            }
            var laser=allLaserHeads.find(function(h){return h.name===laserName;})||eligibleLasers(id)[0];
            if(!laser) return null;
            mods=mods.slice(0,Math.max(0,n(laser.moduleSlots)));
            return {shipId:id,role:role,laser:laser.name,basePower:n(laser.power),resistanceEffect:n(laser.resistanceEffect),instabilityEffect:n(laser.instabilityEffect),modules:mods};
        }).filter(Boolean);
    }

    function variants(id,strat,p,s){
        return [
            {key:"primary",label:"Primary",arms:makeVariant(id,strat[id]||[],p,s,0)},
            {key:"backup-a",label:"Backup A",arms:makeVariant(id,strat[id]||[],p,s,1)},
            {key:"backup-b",label:"Backup B",arms:makeVariant(id,strat[id]||[],p,s,2)}
        ];
    }

    function repeat(v,count){var out=[];for(var i=0;i<count;i++)v.arms.forEach(function(a){out.push(Object.assign({},a,{vesselIndex:i+1}));});return out;}
    function gadgetChoices(p){var selected=el("gadgetSelect")?el("gadgetSelect").value:"None";if(!p.allowGadgets)return["None"];if(selected!=="None")return[selected];return gadgets.map(function(g){return g.name;});}
    function compText(c){var b=[];if(c.mole)b.push(c.mole+"× MOLE");if(c.prospector)b.push(c.prospector+"× Prospector");if(c.golem)b.push(c.golem+"× Golem");return b.join(" + ");}

    function solve(s,baseArms,support,p,strat){
        var vars={}, deployed=deployedCounts(), currentShips=deployed.mole+deployed.prospector+deployed.golem, options=[];
        ORDER.forEach(function(id){vars[id]=variants(id,strat,p,s);});
        for(var m=0;m<=support.mole;m++) for(var pr=0;pr<=support.prospector;pr++) for(var g=0;g<=support.golem;g++){
            var added=m+pr+g;if(!added||currentShips+added>Math.max(1,n(p.maxFleetSize,6)))continue;
            var counts={mole:m,prospector:pr,golem:g,added:added}, active=ORDER.filter(function(id){return counts[id]>0;});
            function walk(i,pick){
                if(i<active.length){var id=active[i];vars[id].forEach(function(v){pick[id]=v;walk(i+1,pick);});delete pick[id];return;}
                var proposed=[];ORDER.forEach(function(id){if(counts[id]&&pick[id])proposed=proposed.concat(repeat(pick[id],counts[id]));});
                gadgetChoices(p).forEach(function(gadget){
                    options.push({counts:counts,selection:Object.assign({},pick),gadget:gadget,evaluation:evaluate(s.baseResistance,s.baseInstability,s.mass,baseArms.concat(proposed),gadget)});
                });
            }
            walk(0,{});
        }
        function tuple(o){
            if(p.optimizerObjective==="maximum-margin")return[o.evaluation.success?0:1,-o.evaluation.marginPct,o.counts.added];
            if(p.optimizerObjective==="minimum-instability")return[o.evaluation.success?0:1,o.counts.added,o.evaluation.finalInstability,-o.evaluation.marginPct];
            if(p.optimizerObjective==="minimum-consumables")return[o.evaluation.success?0:1,o.counts.added,o.evaluation.activeModules+(o.gadget==="None"?0:1),-o.evaluation.marginPct];
            return[o.evaluation.success?0:1,o.counts.added,-o.evaluation.marginPct];
        }
        options.sort(function(a,b){var x=tuple(a),y=tuple(b);for(var i=0;i<Math.max(x.length,y.length);i++){var d=(x[i]||0)-(y[i]||0);if(d)return d;}return 0;});
        var seen={}, unique=[];
        options.forEach(function(o){var k=o.counts.mole+"/"+o.counts.prospector+"/"+o.counts.golem+"/"+o.gadget;if(!seen[k]){seen[k]=true;unique.push(o);}});
        var good=unique.filter(function(o){return o.evaluation.success;});
        return {variants:vars,options:(good.length?good:unique).slice(0,6)};
    }

    function armLine(a){return esc(a.laser)+((a.modules||[]).length?" + "+esc(a.modules.join(" + ")):"");}
    function vesselHtml(id,count,v){
        if(!count||!v)return"";
        var title=count>1?count+"× "+LABEL[id]+" — EACH VESSEL":LABEL[id];
        return '<div class="solver-vessel"><div class="solver-vessel-title">'+esc(title)+'</div>'+
            v.arms.map(function(a,i){return '<div class="solver-arm"><span>'+esc(a.role||("Arm "+(i+1)))+'</span><strong>'+armLine(a)+'</strong></div>';}).join("")+'</div>';
    }

    function alternativeHtml(o,vars,baseArms,s){
        var rows=[];
        ORDER.forEach(function(id){
            if(!o.counts[id])return;
            vars[id].filter(function(v){return v.key!==o.selection[id].key;}).forEach(function(v){
                var proposed=[];
                ORDER.forEach(function(t){if(o.counts[t])proposed=proposed.concat(repeat(t===id?v:o.selection[t],o.counts[t]));});
                var e=evaluate(s.baseResistance,s.baseInstability,s.mass,baseArms.concat(proposed),o.gadget);
                rows.push('<div class="solver-backup"><div><strong>'+esc(LABEL[id])+' · '+esc(v.label)+'</strong><span>'+
                    (e.success?'Still viable · '+(e.marginPct>=0?'+':'')+e.marginPct.toFixed(1)+'% margin':'Not sufficient in this option · '+e.marginPct.toFixed(1)+'% margin')+
                    '</span></div><div class="solver-backup-arms">'+v.arms.map(function(a){return '<code>'+esc(a.role)+': '+armLine(a)+'</code>';}).join("")+'</div></div>');
            });
        });
        return rows.length?'<details class="solver-alternatives"><summary>Secondary equipment alternatives</summary><div class="solver-alternative-list">'+rows.join("")+'</div></details>':"";
    }

    function optionHtml(o,index,vars,baseArms,s){
        var e=o.evaluation, status=e.success?((e.marginPct>=0?"+":"")+e.marginPct.toFixed(1)+"% margin"):(Math.abs(e.marginPct).toFixed(1)+"% short");
        return '<article class="solver-option '+(e.success?'viable':'short')+'"><div class="solver-option-head"><div><span class="solver-option-label">OPTION '+String.fromCharCode(65+index)+'</span><h4>'+esc(compText(o.counts))+'</h4></div><div class="solver-option-status">'+esc(status)+'</div></div>'+
            '<div class="solver-option-metrics"><span>Combined <strong>'+Math.round(e.power).toLocaleString()+' MW</strong></span><span>Required <strong>'+(Number.isFinite(e.required)?Math.round(e.required).toLocaleString()+' MW':'Impossible')+'</strong></span><span>Resistance <strong>'+e.finalResistance.toFixed(1)+'%</strong></span><span>Instability <strong>'+e.finalInstability.toFixed(1)+'%</strong></span><span>Gadget <strong>'+esc(o.gadget)+'</strong></span></div>'+
            '<div class="solver-vessels">'+ORDER.map(function(id){return vesselHtml(id,o.counts[id],o.selection[id]);}).join("")+'</div>'+alternativeHtml(o,vars,baseArms,s)+'</article>';
    }

    function snapshot(t,d,s){
        return '<div class="solver-fleet-snapshot"><div><span>Operation fleet</span><strong>'+t.mole+' MOLE · '+t.prospector+' Prospector · '+t.golem+' Golem</strong></div><div><span>Already deployed</span><strong>'+d.mole+' MOLE · '+d.prospector+' Prospector · '+d.golem+' Golem</strong></div><div><span>Available to assist</span><strong>'+s.mole+' MOLE · '+s.prospector+' Prospector · '+s.golem+' Golem</strong></div></div>';
    }

    function render(ctx){
        var box=el("configs");if(!box)return;
        var p=prefs(), d=deployedCounts();
        var totals={mole:Math.max(0,Math.floor(n(p.fleetAvailableMole))),prospector:Math.max(0,Math.floor(n(p.fleetAvailableProspector))),golem:Math.max(0,Math.floor(n(p.fleetAvailableGolem)))};
        var support={mole:Math.max(0,totals.mole-d.mole),prospector:Math.max(0,totals.prospector-d.prospector),golem:Math.max(0,totals.golem-d.golem)};
        var baseArms=currentArms(), selected=el("gadgetSelect")?el("gadgetSelect").value:"None";
        var current=evaluate(ctx.baseResistance,ctx.baseInstability,ctx.mass,baseArms,selected);
        var state={mass:ctx.mass,baseResistance:ctx.baseResistance,baseInstability:ctx.baseInstability,currentPower:ctx.currentPower,deficit:Math.max(0,n(ctx.legacyRequiredPower)-n(ctx.currentPower))};
        var snap=snapshot(totals,d,support);
        if(current.success){box.innerHTML=snap+'<div class="solver-current-ok"><strong>CURRENT DEPLOYED FLEET IS SUFFICIENT</strong><span>'+(current.marginPct>=0?"+":"")+current.marginPct.toFixed(1)+'% deterministic fracture margin.</span></div>';return;}
        if(support.mole+support.prospector+support.golem===0){box.innerHTML=snap+'<div class="solver-no-option"><strong>NO UNDEPLOYED SUPPORT VESSELS ARE AVAILABLE</strong><span>Increase Operational Fleet totals or revise the current loadout.</span></div>';return;}
        var strat=strategy(state), solved=solve(state,baseArms,support,p,strat);
        if(!solved.options.length){box.innerHTML=snap+'<div class="solver-no-option"><strong>NO SOLUTION FOUND WITH THE AVAILABLE OPERATION FLEET</strong></div>';return;}
        var viable=solved.options.filter(function(o){return o.evaluation.success;}).length;
        box.innerHTML=snap+'<div class="solver-portfolio-head"><div><span>COOPERATIVE SOLUTION PORTFOLIO</span><strong>'+(viable?viable+' VIABLE SUPPORT OPTION'+(viable===1?'':'S'):'CLOSEST AVAILABLE OPTIONS')+'</strong></div><div>'+esc(strat.name)+'</div></div>'+
            '<div class="solver-or-note">These are <strong>OR</strong> solutions. Choose one complete option; separate cards are not cumulative requirements.</div>'+
            '<div class="solver-option-list">'+solved.options.map(function(o,i){return optionHtml(o,i,solved.variants,baseArms,state);}).join('<div class="solver-or-divider"><span>OR</span></div>')+'</div>'+
            '<div class="solver-method-note">Every displayed option is recalculated with MFA’s existing deterministic power/resistance/instability mechanics for the complete proposed fleet. Secondary loadouts are tested against the same formula. Other preserved mining attributes are not invented into the fracture formula until separately validated.</div>';
    }

    window.MFACoopSolver={render:render,evaluate:evaluate};
})();