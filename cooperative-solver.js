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
            allowGadgets:true,
            fleetEnabledMole:true, fleetEnabledProspector:true, fleetEnabledGolem:true,
            fleetAvailableMole:1, fleetAvailableProspector:2, fleetAvailableGolem:1
        };
    }

    function deployedCounts(){
        if(window.MFAFleetPlanner && typeof MFAFleetPlanner.getRoleCounts==="function"){
            return MFAFleetPlanner.getRoleCounts().active;
        }
        var arms={mole:0,prospector:0,golem:0}, out={};
        document.querySelectorAll(".ship-arm-card").forEach(function(card){
            var enabled=document.getElementById(card.id+"-enable");
            if(enabled&&enabled.checked&&Object.prototype.hasOwnProperty.call(arms,card.dataset.ship)) arms[card.dataset.ship]++;
        });
        ORDER.forEach(function(id){
            var ship=ships.find(function(s){return s.id===id;});
            out[id]=arms[id]?Math.ceil(arms[id]/Math.max(1,ship?ship.arms:1)):0;
        });
        return out;
    }

    function availableCounts(totals,deployed){
        if(window.MFAFleetPlanner && typeof MFAFleetPlanner.getRoleCounts==="function"){
            return MFAFleetPlanner.getRoleCounts().available;
        }
        return {
            mole:Math.max(0,totals.mole-deployed.mole),
            prospector:Math.max(0,totals.prospector-deployed.prospector),
            golem:Math.max(0,totals.golem-deployed.golem)
        };
    }

    function laserSlotCount(laserName){
        var head=allLaserHeads.find(function(h){return h.name===laserName;});
        return Math.max(0,Math.floor(n(head&&head.moduleSlots)));
    }

    function currentArms(){
        var out=[];
        document.querySelectorAll(".ship-arm-card").forEach(function(card){
            var enabled=el(card.id+"-enable");
            if(!enabled || !enabled.checked) return;

            var ls=el(card.id+"-laser");
            if(!ls || ls.selectedIndex<0) return;

            var opt=ls.options[ls.selectedIndex];
            var laserName=(opt.textContent||"Current").split("(")[0].trim();
            var slotCount=Math.max(0,Math.floor(n(opt.dataset.slots,laserSlotCount(laserName))));
            var modules=[];
            var fittedModules=[];

            for(var i=1;i<=slotCount;i++){
                var ms=el(card.id+"-mod"+i);
                var selectedName=ms && !ms.disabled ? ms.value : "None";
                var module=powerModules.find(function(x){return x.name===selectedName;});
                var toggle=el(card.id+"-mod"+i+"-active-toggle");
                var isActiveModule=!!(module && module.activation==="Active");
                var isOn=!isActiveModule || !!(toggle && toggle.checked);

                fittedModules.push({
                    slot:i,
                    name:selectedName && selectedName!=="None" ? selectedName : "Empty",
                    activation:module ? module.activation : "Empty",
                    active:isOn
                });

                // Protected v5.35 calculation semantics: only effective modules enter mechanics.
                if(module && module.name!=="None" && (module.activation!=="Active" || isOn)){
                    modules.push(module.name);
                }
            }

            var vesselCard=card.closest(".fleet-vessel-card");
            var vesselKey=vesselCard?vesselCard.dataset.vesselKey:(card.dataset.ship||"unknown");
            var vesselName=vesselCard&&vesselCard.querySelector(".vessel-card-head h3")
                ? vesselCard.querySelector(".vessel-card-head h3").textContent.trim()
                : LABEL[card.dataset.ship]||card.dataset.ship||"Vessel";
            var siblingArms=vesselCard?[].slice.call(vesselCard.querySelectorAll(".ship-arm-card")):[];
            var armIndex=siblingArms.length?siblingArms.indexOf(card)+1:1;

            out.push({
                shipId:card.dataset.ship||"unknown",
                vesselKey:vesselKey,
                vesselName:vesselName,
                armIndex:armIndex,
                role:"Head "+armIndex,
                laser:laserName,
                moduleSlots:slotCount,
                fittedModules:fittedModules,
                basePower:n(ls.value),
                resistanceEffect:n(opt.dataset.resistance),
                instabilityEffect:n(opt.dataset.instability),
                modules:modules
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
        if(s.baseResistance>60) return {
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
        if(role==="Break"||s.baseResistance>55) return (-r*95)+p+(-i*15);
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
            return {
                shipId:id,
                role:role,
                laser:laser.name,
                moduleSlots:Math.max(0,Math.floor(n(laser.moduleSlots))),
                basePower:n(laser.power),
                resistanceEffect:n(laser.resistanceEffect),
                instabilityEffect:n(laser.instabilityEffect),
                modules:mods
            };
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
    function gadgetChoices(p){
        if(!p.allowGadgets)return["None"];
        return gadgets.map(function(g){return g.name;});
    }
    function compText(c){var b=[];if(c.mole)b.push(c.mole+"× MOLE");if(c.prospector)b.push(c.prospector+"× Prospector");if(c.golem)b.push(c.golem+"× Golem");return b.join(" + ");}

    function solveIdeal(s,p,strat){
        var vars={}, options=[];
        var maxFleet=Math.max(1,Math.floor(n(p.maxFleetSize,6)));
        ORDER.forEach(function(id){vars[id]=variants(id,strat,p,s);});

        for(var m=0;m<=maxFleet;m++){
            for(var pr=0;pr<=maxFleet;pr++){
                for(var g=0;g<=maxFleet;g++){
                    var total=m+pr+g;
                    if(total<1 || total>maxFleet) continue;

                    var counts={mole:m,prospector:pr,golem:g,added:total};
                    var active=ORDER.filter(function(id){return counts[id]>0;});

                    function walk(i,pick){
                        if(i<active.length){
                            var id=active[i];
                            vars[id].forEach(function(v){
                                pick[id]=v;
                                walk(i+1,pick);
                            });
                            delete pick[id];
                            return;
                        }

                        var proposed=[];
                        ORDER.forEach(function(id){
                            if(counts[id]&&pick[id]){
                                proposed=proposed.concat(repeat(pick[id],counts[id]));
                            }
                        });

                        gadgetChoices(p).forEach(function(gadget){
                            options.push({
                                counts:counts,
                                selection:Object.assign({},pick),
                                gadget:gadget,
                                evaluation:evaluate(
                                    s.baseResistance,
                                    s.baseInstability,
                                    s.mass,
                                    proposed,
                                    gadget
                                )
                            });
                        });
                    }

                    walk(0,{});
                }
            }
        }

        function tuple(o){
            if(p.optimizerObjective==="maximum-margin"){
                return[o.evaluation.success?0:1,-o.evaluation.marginPct,o.counts.added];
            }
            if(p.optimizerObjective==="minimum-instability"){
                return[o.evaluation.success?0:1,o.counts.added,o.evaluation.finalInstability,-o.evaluation.marginPct];
            }
            if(p.optimizerObjective==="minimum-consumables"){
                return[
                    o.evaluation.success?0:1,
                    o.counts.added,
                    o.evaluation.activeModules+(o.gadget==="None"?0:1),
                    -o.evaluation.marginPct
                ];
            }
            return[o.evaluation.success?0:1,o.counts.added,-o.evaluation.marginPct];
        }

        options.sort(function(a,b){
            var x=tuple(a),y=tuple(b);
            for(var i=0;i<Math.max(x.length,y.length);i++){
                var d=(x[i]||0)-(y[i]||0);
                if(d)return d;
            }

            // Stable deterministic composition tie-break.
            return (a.counts.mole-b.counts.mole) ||
                (a.counts.prospector-b.counts.prospector) ||
                (a.counts.golem-b.counts.golem) ||
                String(a.gadget).localeCompare(String(b.gadget));
        });

        var seen={}, unique=[];
        options.forEach(function(o){
            var selectionKey=ORDER.map(function(id){
                return o.selection[id]?o.selection[id].key:"-";
            }).join("/");
            var k=o.counts.mole+"/"+o.counts.prospector+"/"+o.counts.golem+"/"+selectionKey+"/"+o.gadget;
            if(!seen[k]){
                seen[k]=true;
                unique.push(o);
            }
        });

        var good=unique.filter(function(o){return o.evaluation.success;});
        return {variants:vars,options:(good.length?good:unique).slice(0,5)};
    }

    function normalizedSlots(a){
        if(Array.isArray(a.fittedModules) && a.fittedModules.length){
            return a.fittedModules.map(function(slot){
                return {
                    slot:slot.slot,
                    name:slot.name||"Empty",
                    activation:slot.activation||"Empty",
                    active:slot.active!==false
                };
            });
        }

        var count=Math.max(0,Math.floor(n(a.moduleSlots,laserSlotCount(a.laser))));
        var modules=(a.modules||[]).slice();
        var slots=[];
        for(var i=1;i<=count;i++){
            var name=modules[i-1]||"Empty";
            var module=powerModules.find(function(m){return m.name===name;});
            slots.push({
                slot:i,
                name:name,
                activation:module?module.activation:"Empty",
                active:true
            });
        }
        return slots;
    }

    function moduleSlotLine(slot){
        if(!slot || slot.name==="Empty") return "Empty";
        if(slot.activation==="Active") return slot.name+" · Active "+(slot.active?"ON":"OFF");
        if(slot.activation==="Passive") return slot.name+" · Passive";
        return slot.name;
    }

    function armLoadoutHtml(a,index){
        var slots=normalizedSlots(a);
        return '<div class="solver-head-loadout">'+
            '<div class="solver-head-line"><span>'+esc(a.role||("Head "+(index+1)))+'</span><strong>'+esc(a.laser)+'</strong></div>'+
            (slots.length?'<div class="solver-module-slots">'+slots.map(function(slot){
                return '<div class="solver-module-slot"><span>Module '+slot.slot+'</span><strong>'+esc(moduleSlotLine(slot))+'</strong></div>';
            }).join("")+'</div>':'<div class="solver-module-slots empty"><div class="solver-module-slot"><span>Modules</span><strong>No module slots</strong></div></div>')+
            '</div>';
    }

    function armLine(a){
        var slots=normalizedSlots(a).map(function(slot){return slot.name;});
        return esc(a.laser)+(slots.length?" + "+esc(slots.join(" + ")):"");
    }
    function vesselHtml(id,count,v){
        if(!count||!v)return"";
        var rows=[];
        for(var vesselIndex=1;vesselIndex<=count;vesselIndex++){
            rows.push('<div class="solver-vessel solver-required-vessel">'+
                '<div class="solver-vessel-title"><span>'+esc(LABEL[id])+' #'+vesselIndex+'</span><em>REQUIRED LOADOUT</em></div>'+
                v.arms.map(function(a,i){return armLoadoutHtml(a,i);}).join("")+
                '</div>');
        }
        return rows.join("");
    }

    function currentFleetLoadoutHtml(arms,gadgetName){
        if(!arms.length)return"";
        var groups={},order=[];
        arms.forEach(function(a){
            var key=a.vesselKey||a.shipId||"vessel";
            if(!groups[key]){groups[key]={name:a.vesselName||LABEL[a.shipId]||"Vessel",arms:[]};order.push(key);}
            groups[key].arms.push(a);
        });
        return '<div class="solver-current-loadouts">'+
            '<div class="solver-loadout-heading"><span>ACTIVE VESSEL LOADOUTS</span><strong>Exact configuration currently producing this verdict</strong><em>Gadget: '+esc(gadgetName||"None")+'</em></div>'+
            '<div class="solver-vessels">'+order.map(function(key,index){
                var g=groups[key];
                return '<div class="solver-vessel solver-current-vessel">'+
                    '<div class="solver-vessel-title"><span>'+esc(g.name)+' #'+(index+1)+'</span><em>CURRENT FITTED</em></div>'+
                    g.arms.sort(function(a,b){return n(a.armIndex)-n(b.armIndex);}).map(function(a,i){
                        return armLoadoutHtml(a,i);
                    }).join("")+
                    '</div>';
            }).join("")+'</div></div>';
    }

    function alternativeHtml(o,vars,s){
        var rows=[];
        ORDER.forEach(function(id){
            if(!o.counts[id])return;
            vars[id].filter(function(v){return v.key!==o.selection[id].key;}).forEach(function(v){
                var proposed=[];
                ORDER.forEach(function(t){if(o.counts[t])proposed=proposed.concat(repeat(t===id?v:o.selection[t],o.counts[t]));});
                var e=evaluate(s.baseResistance,s.baseInstability,s.mass,proposed,o.gadget);
                rows.push('<div class="solver-backup"><div><strong>'+esc(LABEL[id])+' · '+esc(v.label)+'</strong><span>'+
                    (e.success?'Still viable · '+(e.marginPct>=0?'+':'')+e.marginPct.toFixed(1)+'% margin':'Not sufficient in this option · '+e.marginPct.toFixed(1)+'% margin')+
                    '</span></div><div class="solver-backup-arms comprehensive">'+v.arms.map(function(a,i){return armLoadoutHtml(a,i);}).join("")+'</div></div>');
            });
        });
        return rows.length?'<details class="solver-alternatives"><summary>Secondary equipment alternatives</summary><div class="solver-alternative-list">'+rows.join("")+'</div></details>':"";
    }

    function optionHtml(o,index,vars,s){
        var e=o.evaluation, status=e.success?((e.marginPct>=0?"+":"")+e.marginPct.toFixed(1)+"% margin"):(Math.abs(e.marginPct).toFixed(1)+"% short");
        return '<article class="solver-option '+(e.success?'viable':'short')+'"><div class="solver-option-head"><div><span class="solver-option-label">OPTION '+String.fromCharCode(65+index)+'</span><h4>'+esc(compText(o.counts))+'</h4></div><div class="solver-option-status">'+esc(status)+'</div></div>'+
            '<div class="solver-option-metrics"><span>Combined <strong>'+Math.round(e.power).toLocaleString()+' MW</strong></span><span>Required <strong>'+(Number.isFinite(e.required)?Math.round(e.required).toLocaleString()+' MW':'Impossible')+'</strong></span><span>Resistance <strong>'+e.finalResistance.toFixed(1)+'%</strong></span><span>Instability <strong>'+e.finalInstability.toFixed(1)+'%</strong></span><span>Gadget <strong>'+esc(o.gadget)+'</strong></span></div>'+
            '<div class="solver-vessels">'+ORDER.map(function(id){return vesselHtml(id,o.counts[id],o.selection[id]);}).join("")+'</div>'+alternativeHtml(o,vars,s)+'</article>';
    }

    function targetBasisHtml(ctx,p){
        var material=el("materialName")?el("materialName").value.trim():"";
        var objectiveLabels={
            "minimum-ships":"Minimum ships",
            "maximum-margin":"Maximum margin",
            "minimum-instability":"Minimum instability",
            "minimum-consumables":"Minimum consumables"
        };

        return '<div class="solver-target-basis">'+
            '<div><span>Target mass</span><strong>'+Math.round(n(ctx.mass)).toLocaleString()+' kg</strong></div>'+
            '<div><span>Resistance</span><strong>'+n(ctx.baseResistance).toFixed(1)+'%</strong></div>'+
            '<div><span>Instability</span><strong>'+n(ctx.baseInstability).toFixed(1)+'%</strong></div>'+
            (material?'<div><span>Material</span><strong>'+esc(material)+'</strong></div>':'')+
            '<div><span>Objective</span><strong>'+esc(objectiveLabels[p.optimizerObjective]||"Minimum ships")+'</strong></div>'+
            '<div><span>Max ideal fleet</span><strong>'+Math.max(1,Math.floor(n(p.maxFleetSize,6)))+'</strong></div>'+
            '<div><span>Active modules</span><strong>'+(p.allowActiveModules?'Allowed':'Passive only')+'</strong></div>'+
            '<div><span>Gadgets</span><strong>'+(p.allowGadgets?'Search allowed':'Disabled')+'</strong></div>'+
            '</div>';
    }

    function render(ctx){
        var box=el("configs");
        if(!box)return;

        var p=prefs();
        var state={
            mass:n(ctx.mass),
            baseResistance:n(ctx.baseResistance),
            baseInstability:n(ctx.baseInstability)
        };

        var basis=targetBasisHtml(ctx,p);
        var strat=strategy(state);
        var solved=solveIdeal(state,p,strat);

        if(!solved.options.length){
            box.innerHTML=basis+
                '<div class="solver-no-option"><strong>NO IDEAL SOLUTION FOUND WITHIN THE CURRENT MISSION CONSTRAINTS</strong><span>Increase Max Fleet or allow additional equipment classes.</span></div>';
            return;
        }

        var best=solved.options[0];
        var others=solved.options.slice(1);

        var alternatives=others.length
            ? '<details class="solver-more-plans"><summary>Show '+others.length+' other ideal / closest plan'+(others.length===1?'':'s')+'</summary><div class="solver-other-list">'+
              others.map(function(o,i){
                  return optionHtml(o,i+1,solved.variants,state);
              }).join('<div class="solver-or-divider"><span>OR</span></div>')+
              '</div></details>'
            : '';

        box.innerHTML=basis+
            '<div class="solver-portfolio-head"><div><span>TARGET-DRIVEN IDEAL SOLUTION</span><strong>'+
                (best.evaluation.success?'RECOMMENDED IDEAL LOADOUT':'CLOSEST PLAN WITHIN CONSTRAINTS')+
            '</strong></div><div>'+esc(strat.name)+'</div></div>'+
            '<div class="solver-or-note"><strong>Fleet Planner independent.</strong> This recommendation starts from the Target Acquisition values and mission constraints only. Your actual vessels and fitted loadouts do not bias the ideal solution.</div>'+
            '<div class="solver-best-option">'+optionHtml(best,0,solved.variants,state)+'</div>'+
            alternatives+
            '<div class="solver-method-note">The Fracture Verdict continues to represent your actual active Fleet Planner configuration. Recommended Solutions is a separate ideal-planning calculation using the same protected deterministic MFA power/resistance/instability mechanics. The current ideal search uses MFA’s validated strategy candidate set; it does not yet claim exhaustive enumeration of every possible equipment combination.</div>';
    }

    window.MFACoopSolver={render:render,evaluate:evaluate,solveIdeal:solveIdeal};
})();