const KODE_VAULT = "0303";
const WORDS = ["YOU","LOOK","BETTER","WITH","ME","HERE"];

/* NAVIGATION */
function show(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

/* VAULT */
function checkCode(){
    let code = ["d0","d1","d2","d3"].map(id=>document.getElementById(id).value).join("");
    if(code===KODE_VAULT){
        show("s-memory");
        initMemory();
    } else {
        document.getElementById("vaultMsg").innerText="Wrong code";
    }
}

/* MEMORY */
const symbols=["❤️","🎵","🕯️","🔑","🖤","✨","🌹","💌"];
let first, second, lock, matches;

function initMemory(){
    const grid=document.getElementById("cardGrid");
    grid.innerHTML="";
    let cards=[...symbols,...symbols].sort(()=>0.5-Math.random());

    first=null; second=null; lock=false; matches=0;

    cards.forEach(sym=>{
        let c=document.createElement("div");
        c.className="card";
        c.dataset.sym=sym;

        c.onclick=()=>{
            if(lock||c.classList.contains("flipped")) return;

            c.classList.add("flipped");
            c.innerText=sym;

            if(!first){ first=c; }
            else{
                second=c; lock=true;

                if(first.dataset.sym===second.dataset.sym){
                    matches++;
                    first=null; second=null; lock=false;

                    if(matches===8){
                        setTimeout(()=>show("s-popup"),500);
                    }

                } else {
                    setTimeout(()=>{
                        first.classList.remove("flipped");
                        second.classList.remove("flipped");
                        first.innerText="";
                        second.innerText="";
                        first=null; second=null; lock=false;
                    },800);
                }
            }
        };

        grid.appendChild(c);
    });
}

/* WORD SEARCH */
let selecting=false;
let selected=[];

function startWords(){
    show("s-words");
    buildGrid();
}

function buildGrid(){
    const grid=document.getElementById("wordGrid");
    grid.innerHTML="";
    let letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for(let i=0;i<100;i++){
        let d=document.createElement("div");
        d.className="wcell";
        d.innerText=letters[Math.floor(Math.random()*26)];

        d.onmousedown=()=>start(d);
        d.onmouseover=()=>move(d);
        d.onmouseup=end;

        grid.appendChild(d);
    }
}

function start(c){ selecting=true; selected=[c]; c.classList.add("sel"); }
function move(c){ if(selecting&&!selected.includes(c)){ selected.push(c); c.classList.add("sel"); } }
function end(){
    selecting=false;
    let word=selected.map(c=>c.innerText).join("");
    if(WORDS.includes(word)){
        selected.forEach(c=>c.classList.add("found"));
    } else {
        selected.forEach(c=>c.classList.remove("sel"));
    }
    selected=[];
}

/* LETTER */
function openLetter(){
    document.getElementById("letterCard").classList.add("show");
}