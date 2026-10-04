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
            optimizerObjective:"balanced-operations", maxFleetSize:6, minimumMarginPct:10, allowActiveModules:true,
            allowGadgets:true,
            recommendMole:true, recommendMoleMax:1,
            recommendProspector:true, recommendProspectorMax:2,
            recommendGolem:true, recommendGolemMax:1,
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

    function recommendationCaps(p,maxFleet){
        function cap(enabled,value,fallback){
            if(enabled===false)return 0;
            return Math.max(0,Math.min(maxFleet,Math.floor(n(value,fallback))));
        }
        return {
            mole:cap(p.recommendMole,p.recommendMoleMax,1),
            prospector:cap(p.recommendProspector,p.recommendProspectorMax,2),
            golem:cap(p.recommendGolem,p.recommendGolemMax,1)
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

    function recommendedArmToRuntime(a){
        return {
            enabled:true,
            power:n(a.basePower),
            resistanceEffect:n(a.resistanceEffect),
            instabilityEffect:n(a.instabilityEffect),
            modules:(a.modules||[]).map(function(name){
                var m=powerModules.find(function(x){return x.name===name;});
                if(!m)return null;
                return {
                    name:m.name,
                    activation:m.activation,
                    // Recommended Active modules are part of the required operating state.
                    active:true,
                    multiplier:m.multiplier,
                    resistanceEffect:m.resistanceEffect,
                    instabilityEffect:m.instabilityEffect
                };
            }).filter(Boolean)
        };
    }

    function evaluate(baseRes,baseInst,mass,arms,gadgetName){
        if(!window.MFAV535 || typeof window.MFAV535.calculateV535!=="function"){
            throw new Error("Shared MFA v5.35 runtime engine is unavailable.");
        }

        var gadget=gadgets.find(function(x){return x.name===gadgetName;})||null;
        var calc=window.MFAV535.calculateV535({
            rockMass:mass,
            resistance:baseRes,
            instability:baseInst,
            arms:(arms||[]).map(recommendedArmToRuntime),
            gadget:gadget
        });

        var margin=calc.requiredPower>0 && calc.requiredPower<999999
            ? (calc.totalPower-calc.requiredPower)/calc.requiredPower*100
            : -Infinity;

        var activeModules=0;
        (arms||[]).forEach(function(a){
            (a.modules||[]).forEach(function(name){
                var m=powerModules.find(function(x){return x.name===name;});
                if(m&&m.activation==="Active")activeModules++;
            });
        });

        return {
            success:calc.success,
            power:calc.totalPower,
            required:calc.requiredPower>=999999?Infinity:calc.requiredPower,
            displayRequired:calc.requiredPower>=999999?calc.baselineRequiredPower:calc.requiredPower,
            resistanceBlocked:calc.requiredPower>=999999,
            finalResistance:calc.finalResistance,
            finalInstability:calc.finalInstability,
            marginPct:margin,
            activeModules:activeModules
        };
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

    function gadgetChoices(p){
        if(!p.allowGadgets)return["None"];
        return gadgets.map(function(g){return g.name;});
    }
    function compText(c){var b=[];if(c.mole)b.push(c.mole+"× MOLE");if(c.prospector)b.push(c.prospector+"× Prospector");if(c.golem)b.push(c.golem+"× Golem");return b.join(" + ");}

    function variantAssignments(list,count){
        if(count<=0)return[[]];
        var out=[];
        function walk(depth,start,pick){
            if(depth===count){out.push(pick.slice());return;}
            for(var i=start;i<list.length;i++){
                pick.push(list[i]);
                walk(depth+1,i,pick);
                pick.pop();
            }
        }
        walk(0,0,[]);
        return out;
    }

    function buildVesselPlans(counts,vars){
        var active=ORDER.filter(function(id){return counts[id]>0;});
        var choices={};
        active.forEach(function(id){choices[id]=variantAssignments(vars[id],counts[id]);});
        var out=[];
        function walk(i,pick){
            if(i===active.length){
                var plans=[];
                active.forEach(function(id){
                    (pick[id]||[]).forEach(function(v,index){
                        plans.push({shipId:id,vesselIndex:index+1,variant:v});
                    });
                });
                out.push(plans);
                return;
            }
            var id=active[i];
            choices[id].forEach(function(combo){
                pick[id]=combo;
                walk(i+1,pick);
            });
            delete pick[id];
        }
        walk(0,{});
        return out;
    }

    function proposedArms(plans){
        var out=[];
        (plans||[]).forEach(function(plan){
            plan.variant.arms.forEach(function(a){
                out.push(Object.assign({},a,{vesselIndex:plan.vesselIndex}));
            });
        });
        return out;
    }

    function resourceMetrics(plans,evaluation,gadget){
        var heads=0,operators=0;
        (plans||[]).forEach(function(plan){
            var activeHeads=plan.variant.arms.length;
            heads+=activeHeads;
            operators+=plan.shipId==="mole" ? 1+activeHeads : 1;
        });
        return {
            hulls:(plans||[]).length,
            heads:heads,
            operators:operators,
            consumables:evaluation.activeModules+(gadget==="None"?0:1)
        };
    }

    function safetyClass(o,minMargin){
        if(!o.evaluation.success)return 2;
        return o.evaluation.marginPct>=minMargin?0:1;
    }

    function objectiveTuple(o,objective,minMargin){
        var q=safetyClass(o,minMargin),r=o.resources,e=o.evaluation;
        if(objective==="minimum-hulls")return[q,r.hulls,r.operators,-e.marginPct,e.finalInstability];
        if(objective==="minimum-crew")return[q,r.operators,r.hulls,-e.marginPct,e.finalInstability];
        if(objective==="maximum-margin")return[q,-e.marginPct,r.hulls,r.operators,e.finalInstability];
        if(objective==="minimum-instability")return[q,e.finalInstability,r.hulls,r.operators,-e.marginPct];
        if(objective==="minimum-consumables")return[q,r.consumables,r.hulls,r.operators,-e.marginPct];
        return[q,r.operators,r.hulls,e.finalInstability,r.consumables,-e.marginPct];
    }

    function stableKey(o){
        var plans=(o.vesselPlans||[]).map(function(plan){
            return plan.shipId+"#"+plan.vesselIndex+":"+plan.variant.key;
        }).join("|");
        return [o.counts.mole,o.counts.prospector,o.counts.golem,plans,o.gadget].join("/");
    }

    function compareFor(objective,minMargin){
        return function(a,b){
            var x=objectiveTuple(a,objective,minMargin),y=objectiveTuple(b,objective,minMargin);
            for(var i=0;i<Math.max(x.length,y.length);i++){
                var d=(x[i]||0)-(y[i]||0);
                if(d)return d;
            }
            return stableKey(a).localeCompare(stableKey(b));
        };
    }

    function solveIdeal(s,p,strat){
        var vars={},options=[];
        var maxFleet=Math.max(1,Math.floor(n(p.maxFleetSize,6)));
        var minMargin=Math.max(0,n(p.minimumMarginPct,10));
        var caps=recommendationCaps(p,maxFleet);
        ORDER.forEach(function(id){vars[id]=variants(id,strat,p,s);});

        for(var m=0;m<=caps.mole;m++){
            for(var pr=0;pr<=caps.prospector;pr++){
                for(var g=0;g<=caps.golem;g++){
                    var total=m+pr+g;
                    if(total<1 || total>maxFleet)continue;
                    var counts={mole:m,prospector:pr,golem:g,added:total};
                    buildVesselPlans(counts,vars).forEach(function(plans){
                        var arms=proposedArms(plans);
                        gadgetChoices(p).forEach(function(gadget){
                            var evaluation=evaluate(s.baseResistance,s.baseInstability,s.mass,arms,gadget);
                            options.push({
                                counts:counts,
                                vesselPlans:plans,
                                gadget:gadget,
                                evaluation:evaluation,
                                resources:resourceMetrics(plans,evaluation,gadget)
                            });
                        });
                    });
                }
            }
        }

        var unique=[],seen={};
        options.forEach(function(o){
            var key=stableKey(o);
            if(!seen[key]){seen[key]=true;unique.push(o);}
        });

        var objective=p.optimizerObjective||"balanced-operations";
        unique.sort(compareFor(objective,minMargin));

        var portfolio={};
        [
            "balanced-operations",
            "minimum-hulls",
            "minimum-crew",
            "maximum-margin",
            "minimum-instability",
            "minimum-consumables"
        ].forEach(function(name){
            portfolio[name]=unique.slice().sort(compareFor(name,minMargin))[0]||null;
        });

        return {
            variants:vars,
            options:unique.slice(0,5),
            portfolio:portfolio,
            minimumMarginPct:minMargin
        };
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
    function vesselPlanHtml(plan,withAssist){
        var id=plan.shipId,v=plan.variant,vesselIndex=plan.vesselIndex;
        var assistId="assist-"+id+"-"+vesselIndex;
        return '<div class="solver-vessel solver-required-vessel '+(withAssist?'assist-missing':'')+'">'+
            '<div class="solver-vessel-title"><span>'+esc(LABEL[id])+' #'+vesselIndex+'</span><em>'+esc(v.label)+' · REQUIRED LOADOUT</em></div>'+
            (withAssist?'<label class="solver-assist-availability" for="'+assistId+'">'+
                '<input type="checkbox" id="'+assistId+'" class="solver-assist-check" data-ship="'+esc(id)+'" data-vessel-index="'+vesselIndex+'" onchange="window.MFACoopSolver.updateAvailabilitySummary()">'+
                '<span class="solver-assist-box" aria-hidden="true"></span>'+
                '<span class="solver-assist-copy"><strong>Available to assist</strong><small>Confirm this recommended vessel can join the operation.</small><b class="solver-assist-state">NOT CONFIRMED</b></span>'+
            '</label>':'')+
            v.arms.map(function(a,i){return armLoadoutHtml(a,i);}).join("")+
            '</div>';
    }

    function vesselPlansHtml(o,withAssist){
        return (o.vesselPlans||[]).map(function(plan){return vesselPlanHtml(plan,withAssist);}).join("");
    }

    function qualityLabel(o,minMargin){
        if(!o.evaluation.success)return"NOT VIABLE";
        if(o.evaluation.marginPct>=minMargin)return"SAFE MARGIN";
        return"THIN MARGIN";
    }

    function objectiveLabel(name){
        return {
            "balanced-operations":"Balanced operations",
            "minimum-hulls":"Minimum hulls",
            "minimum-crew":"Minimum crew",
            "maximum-margin":"Maximum fracture margin",
            "minimum-instability":"Minimum instability",
            "minimum-consumables":"Minimum consumables"
        }[name]||"Balanced operations";
    }

    function whyHtml(o,objective,minMargin){
        var e=o.evaluation,r=o.resources,safe=e.success&&e.marginPct>=minMargin;
        var points=[
            (safe?"Meets":"Does not meet")+" "+minMargin.toFixed(0)+"% minimum margin",
            r.operators+" operator"+(r.operators===1?"":"s"),
            r.hulls+" hull"+(r.hulls===1?"":"s"),
            r.heads+" active mining head"+(r.heads===1?"":"s"),
            "Final instability "+e.finalInstability.toFixed(1)+"%",
            r.consumables+" consumable action"+(r.consumables===1?"":"s")
        ];
        return '<div class="solver-why"><strong>WHY THIS PLAN · '+esc(objectiveLabel(objective))+'</strong><ul>'+
            points.map(function(x){return'<li>'+esc(x)+'</li>';}).join("")+
            '</ul></div>';
    }

    function gadgetComparisonHtml(o,state,p,objective,minMargin){
        // Compare gadgets on the SAME recommended fleet and equipment configuration.
        // The final winner was already selected by solveIdeal() over all fleet/gadget
        // combinations. This is an explanatory comparison, not a second optimizer.
        var arms=proposedArms(o.vesselPlans);
        var options=gadgetChoices(p).map(function(name){
            var evaluation=evaluate(state.baseResistance,state.baseInstability,state.mass,arms,name);
            return {
                counts:o.counts,
                vesselPlans:o.vesselPlans,
                gadget:name,
                evaluation:evaluation,
                resources:resourceMetrics(o.vesselPlans,evaluation,name)
            };
        });
        options.sort(compareFor(objective,minMargin));
        var lines=options.map(function(candidate){
            var e=candidate.evaluation;
            var gadget=gadgets.find(function(item){return item.name===candidate.gadget;});
            var v=gadget&&gadget.verified||{};
            var selected=candidate.gadget===o.gadget;
            var margin=Number.isFinite(e.marginPct)
                ? (e.marginPct>=0?"+":"")+e.marginPct.toFixed(1)+"%"
                : "BLOCKED";
            function pct(value){return value==null?"—":(value>0?"+":"")+value+"%";}
            return '<tr'+(selected?' class="solver-gadget-selected"':'')+'>'+
                '<td><strong>'+esc(candidate.gadget)+'</strong>'+(selected?' <em>SELECTED</em>':'')+'</td>'+
                '<td>'+esc(qualityLabel(candidate,minMargin))+'</td>'+
                '<td>'+esc(margin)+'</td>'+
                '<td>'+e.finalResistance.toFixed(1)+'%</td>'+
                '<td>'+e.finalInstability.toFixed(1)+'%</td>'+
                '<td>'+esc(pct(v.optimalChargeWindowRatePct))+'</td>'+
                '<td>'+esc(pct(v.optimalChargeWindowSizePct))+'</td>'+
                '</tr>';
        }).join("");
        return '<details class="solver-gadget-comparison">'+
            '<summary>Gadget comparison · '+esc(o.gadget)+' selected from '+options.length+' option'+(options.length===1?'':'s')+'</summary>'+
            '<p>Same vessel and head/module configuration for every row. Gadget resistance and instability modifiers are included in fracture calculations and objective ranking. Only one gadget is modelled per candidate. The selected gadget on the actual Fleet Planner is independent.</p>'+
            '<div class="solver-gadget-table-wrap"><table><thead><tr>'+
              '<th>Gadget</th><th>Safety</th><th>Margin</th><th>Resistance</th><th>Instability</th><th>Charge rate</th><th>Window size</th>'+
            '</tr></thead><tbody>'+lines+'</tbody></table></div>'+
            '<p class="solver-gadget-model-note">Charge rate, charge-window size and cluster effects are informational reference attributes, not yet part of the audited fracture-power or safety-margin equation. Comparisons rank modelled effects only; they do not establish the safest in-game charge behaviour.</p>'+
            '</details>';
    }

    function decisionHeroHtml(o,objective,minMargin){
        var e=o.evaluation,r=o.resources;
        var safe=e.success&&e.marginPct>=minMargin;
        var state=safe?"SAFE PLAN":e.success?"THIN MARGIN":"NOT VIABLE";
        var margin=Number.isFinite(e.marginPct)?(e.marginPct>=0?"+":"")+e.marginPct.toFixed(1)+"%":"—";
        return '<div class="solver-command-hero '+(safe?'safe':e.success?'thin':'short')+'">'+
            '<div class="solver-command-kicker">MFA RECOMMENDS · '+esc(objectiveLabel(objective))+'</div>'+
            '<div class="solver-command-title-row"><div><h3>'+esc(compText(o.counts))+'</h3><span>'+esc(state)+' · '+r.operators+' operator'+(r.operators===1?'':'s')+' · '+r.heads+' mining head'+(r.heads===1?'':'s')+'</span></div>'+
            '<div class="solver-command-margin"><small>POWER MARGIN</small><strong>'+esc(margin)+'</strong></div></div>'+
            '<div class="solver-command-badges"><span>Gadget <b>'+esc(o.gadget)+'</b></span><span>Strategy <b>'+esc(qualityLabel(o,minMargin))+'</b></span><span>Fleet Planner <b>Independent</b></span></div>'+
            '</div>';
    }

    function planSummaryHtml(o){
        var e=o.evaluation,r=o.resources;
        return '<div class="solver-command-metrics">'+
            '<div><span>Hulls</span><strong>'+r.hulls+'</strong></div>'+
            '<div><span>Operators</span><strong>'+r.operators+'</strong></div>'+
            '<div><span>Mining heads</span><strong>'+r.heads+'</strong></div>'+
            '<div><span>Consumables</span><strong>'+r.consumables+'</strong></div>'+
            '<div><span>Combined</span><strong>'+Math.round(e.power).toLocaleString()+' MW</strong></div>'+
            '<div><span>Required</span><strong class="'+(e.displayRequired>e.power?'power-shortfall':'')+'">'+Math.round(e.displayRequired).toLocaleString()+' MW</strong></div>'+
            '<div><span>Resistance</span><strong>'+e.finalResistance.toFixed(1)+'%</strong></div>'+
            '<div><span>Instability</span><strong>'+e.finalInstability.toFixed(1)+'%</strong></div>'+
            '</div>';
    }

    function exactLoadoutHtml(o){
        return '<section class="solver-command-section solver-command-loadout">'+
            '<div class="solver-command-section-head"><div><span>01 · FIT THIS</span><strong>Exact recommended loadout</strong></div><em>Vessel-specific</em></div>'+
            '<div class="solver-vessels">'+vesselPlansHtml(o,false)+'</div>'+
            '</section>';
    }

    function readinessControlsHtml(o){
        var rows=(o.vesselPlans||[]).map(function(plan){
            var id=plan.shipId,vesselIndex=plan.vesselIndex;
            var assistId="assist-"+id+"-"+vesselIndex;
            return '<label class="solver-assist-availability solver-readiness-vessel" for="'+assistId+'">'+
                '<input type="checkbox" id="'+assistId+'" class="solver-assist-check" data-ship="'+esc(id)+'" data-vessel-index="'+vesselIndex+'" onchange="window.MFACoopSolver.updateAvailabilitySummary()">'+
                '<span class="solver-assist-box" aria-hidden="true"></span>'+
                '<span class="solver-assist-copy"><strong>'+esc(LABEL[id])+' #'+vesselIndex+'</strong><small>Confirm this recommended vessel can deploy.</small><b class="solver-assist-state">NOT CONFIRMED</b></span>'+
                '</label>';
        }).join("");
        return '<section class="solver-command-section solver-command-readiness">'+
            '<div class="solver-command-section-head"><div><span>02 · DEPLOY</span><strong>Deployment readiness</strong></div><em>Confirmation only</em></div>'+
            '<div id="solverAvailabilitySummary" class="solver-availability-summary"><span>ASSISTANCE AVAILABILITY</span><strong>0 of '+o.counts.added+' required vessels confirmed</strong><em>Recommendation remains unchanged.</em></div>'+
            '<div class="solver-readiness-grid">'+rows+'</div>'+
            '</section>';
    }

    function whyPlanHtml(o,objective,minMargin){
        return '<section class="solver-command-section solver-command-why">'+
            '<div class="solver-command-section-head"><div><span>03 · UNDERSTAND</span><strong>Why MFA chose this plan</strong></div><em>'+esc(objectiveLabel(objective))+'</em></div>'+
            whyHtml(o,objective,minMargin)+
            '</section>';
    }

    function optionHtml(o,objective,minMargin,state,p){
        var reproduction='<div class="solver-reproduction-note"><strong>REPRODUCE IN ACTUAL FLEET PLANNER</strong><span>Set exactly '+esc(compText(o.counts))+' to Active, copy the vessel-specific head/module loadouts above, switch every recommended Active module ON, and select gadget <b>'+esc(o.gadget)+'</b>. Extra Active vessels will change the Fracture Verdict.</span></div>';
        return '<article class="solver-command-plan">'+
            decisionHeroHtml(o,objective,minMargin)+
            planSummaryHtml(o)+
            exactLoadoutHtml(o)+
            reproduction+
            readinessControlsHtml(o)+
            whyPlanHtml(o,objective,minMargin)+
            '<details class="solver-command-details solver-gadget-shell"><summary><span>04 · COMPARE</span><strong>Gadget options</strong><em>'+esc(o.gadget)+' selected</em></summary>'+gadgetComparisonHtml(o,state,p,objective,minMargin)+'</details>'+
            '</article>';
    }

    function portfolioHtml(solved,selectedObjective){
        var order=[
            ["balanced-operations","Balanced"],
            ["minimum-hulls","Fewest hulls"],
            ["minimum-crew","Fewest operators"],
            ["maximum-margin","Highest margin"],
            ["minimum-instability","Lowest instability"],
            ["minimum-consumables","Lowest consumables"]
        ];
        var selected=solved.portfolio[selectedObjective]||solved.options[0],seen={},rows=[];
        if(selected)seen[stableKey(selected)]=true;
        order.forEach(function(item){
            var o=solved.portfolio[item[0]];
            if(!o)return;
            var key=stableKey(o);
            if(seen[key])return;
            seen[key]=true;
            rows.push('<div class="solver-portfolio-alt"><div><strong>'+esc(item[1])+'</strong><span>'+esc(compText(o.counts))+'</span></div>'+
                '<div><span>'+o.resources.operators+' ops · '+o.resources.hulls+' hulls · '+o.resources.consumables+' consumables</span><strong>'+
                (o.evaluation.marginPct>=0?"+":"")+o.evaluation.marginPct.toFixed(1)+'% margin · '+o.evaluation.finalInstability.toFixed(1)+'% inst</strong></div></div>');
        });
        return rows.length?'<details class="solver-more-plans"><summary>Objective alternatives</summary><div class="solver-other-list">'+rows.join("")+'</div></details>':"";
    }

    function updateAvailabilitySummary(){
        var summary=el("solverAvailabilitySummary");
        if(!summary)return;
        var checks=[].slice.call(document.querySelectorAll("#configs .solver-assist-check"));
        var confirmed=checks.filter(function(input){return input.checked;}).length;
        var total=checks.length;
        var missing=Math.max(0,total-confirmed);
        var strong=summary.querySelector("strong");
        var note=summary.querySelector("em");

        checks.forEach(function(input){
            var vessel=input.closest(".solver-required-vessel")||input.closest(".solver-readiness-vessel");
            var label=input.closest(".solver-assist-availability");
            var state=label?label.querySelector(".solver-assist-state"):null;
            if(vessel){
                vessel.classList.toggle("assist-confirmed",input.checked);
                vessel.classList.toggle("assist-missing",!input.checked);
            }
            if(label)label.classList.toggle("confirmed",input.checked);
            if(state)state.textContent=input.checked?"CONFIRMED AVAILABLE":"NOT CONFIRMED";
        });

        if(strong){
            strong.textContent=total>0&&missing===0
                ?"READY · all "+total+" required vessel"+(total===1?"":"s")+" confirmed"
                :"NOT READY · "+missing+" vessel"+(missing===1?"":"s")+" still required";
        }
        summary.classList.toggle("ready",total>0&&confirmed===total);
        summary.classList.toggle("partial",confirmed>0&&confirmed<total);
        summary.classList.toggle("missing",total>0&&confirmed===0);
        if(note){
            note.textContent=total>0&&confirmed===total
                ?"All vessels required by the ideal solution are confirmed available."
                :"Ideal loadout remains unchanged; availability only confirms whether the recommended support can actually deploy.";
        }
    }

    function targetBasisHtml(ctx,p){
        var material=el("materialName")?el("materialName").value.trim():"";
        var caps=recommendationCaps(p,Math.max(1,Math.floor(n(p.maxFleetSize,6))));
        return '<div class="solver-target-basis">'+
            '<div><span>Target mass</span><strong>'+Math.round(n(ctx.mass)).toLocaleString()+' kg</strong></div>'+
            '<div><span>Resistance</span><strong>'+n(ctx.baseResistance).toFixed(1)+'%</strong></div>'+
            '<div><span>Instability</span><strong>'+n(ctx.baseInstability).toFixed(1)+'%</strong></div>'+
            (material?'<div><span>Material</span><strong>'+esc(material)+'</strong></div>':'')+
            '<div><span>Objective</span><strong>'+esc(objectiveLabel(p.optimizerObjective))+'</strong></div>'+
            '<div><span>Minimum margin</span><strong>'+Math.max(0,n(p.minimumMarginPct,10)).toFixed(0)+'%</strong></div>'+
            '<div><span>Max ideal fleet</span><strong>'+Math.max(1,Math.floor(n(p.maxFleetSize,6)))+'</strong></div>'+
            '<div><span>Active modules</span><strong>'+(p.allowActiveModules?'Allowed':'Passive only')+'</strong></div>'+
            '<div><span>Gadgets</span><strong>'+(p.allowGadgets?'Search allowed':'Disabled')+'</strong></div>'+
            '<div><span>Recommendation resources</span><strong>'+esc([
                caps.mole?'MOLE ≤ '+caps.mole:null,
                caps.prospector?'Prospector ≤ '+caps.prospector:null,
                caps.golem?'Golem ≤ '+caps.golem:null
            ].filter(Boolean).join(' · ')||'None selected')+'</strong></div>'+
            '<div><span>Fleet Planner influence</span><strong>None · target-driven ideal</strong></div>'+
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

        var objective=p.optimizerObjective||"balanced-operations";
        var best=solved.portfolio[objective]||solved.options[0];
        var safe=best.evaluation.success&&best.evaluation.marginPct>=solved.minimumMarginPct;

        box.innerHTML=
            '<div class="solver-command-integrity"><span>DETERMINISTIC</span><span>TARGET-DRIVEN</span><span>FLEET PLANNER INDEPENDENT</span><span>'+esc(strat.name).toUpperCase()+'</span></div>'+
            '<div class="solver-best-option">'+optionHtml(best,objective,solved.minimumMarginPct,state,p)+'</div>'+
            '<details class="solver-command-details solver-alternative-shell"><summary><span>05 · EXPLORE</span><strong>Alternative objectives</strong><em>What-if plans</em></summary>'+portfolioHtml(solved,objective)+'</details>'+
            '<details class="solver-command-details solver-basis-shell"><summary><span>06 · AUDIT</span><strong>Recommendation basis</strong><em>Inputs & constraints</em></summary>'+basis+
                '<div class="solver-method-note">Ranked under '+esc(objectiveLabel(objective))+'. Availability confirmation is post-recommendation only. The Fracture Verdict continues to represent the actual active Fleet Planner configuration.</div></details>';
        updateAvailabilitySummary();
    }

    window.MFACoopSolver={render:render,evaluate:evaluate,solveIdeal:solveIdeal,recommendationCaps:recommendationCaps,resourceMetrics:resourceMetrics,objectiveTuple:objectiveTuple,variantAssignments:variantAssignments,updateAvailabilitySummary:updateAvailabilitySummary};
})();