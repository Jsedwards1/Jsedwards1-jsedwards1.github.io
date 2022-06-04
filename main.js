const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
carCanvas.height=window.innerHeight*0.6;
const carCtx = carCanvas.getContext("2d");
const pauseBtn=document.getElementById("pause-btn");
const startBtn=document.getElementById("start-btn");
const pauseImg=document.getElementById("pauseImg");
const countSections=document.querySelectorAll(".counter");
const endScreen=document.querySelector(".end-screen");
const endMessages=document.querySelectorAll(".end-screen .message");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);
road.draw(carCtx);



let cars=[];
let traffic=[];
let bestCar=null;


let isPaused=false;
let bestBrain=null;
let testing=false;

let rayCount=0;
let raySpread=0;
let children=0;
let currentGen=1;
let gens=0;

let secCount=0;
let msCount=0;
const genDuration=15;
const testDuration=15;
var testTime;
var checkTime;

const errorP=document.querySelectorAll(".error-txt");
const genTxt=document.getElementById("gen-counter");
const timeTxt=document.getElementById("time-counter");



function checkVals(){

    //Get the values from the HTML form
    rayCount=document.getElementById('sensors').value;
    raySpread=document.getElementById('angle').value;
    children=document.getElementById('children').value;
    gens=document.getElementById('gens').value;

    let validVals=[false, false, false];

    if(rayCount>=1 && rayCount<=15 && rayCount%1==0){
        validVals[0]=true;
    }
    if(raySpread>=10 && raySpread<=360 && raySpread%1==0){
        validVals[1]=true;
    }
    if(children>=100 && children<=500 && children%1==0){
        validVals[2]=true;
    }


    errorP[0].style.opacity=validVals[0]? 0:1;
    errorP[1].style.opacity=validVals[1]? 0:1;
    errorP[2].style.opacity=validVals[2]? 0:1;


    if(validVals[0] && validVals[1] && validVals[2]){
        
        startBtn.style.opacity=0;
        startBtn.style.pointerEvents="none";
        pauseBtn.style.opacity=1;
        pauseBtn.style.pointerEvents="all";
        genTxt.innerHTML=currentGen+" of "+gens;
        timeTxt.innerHTML=secCount+":"+msCount;
        isPaused=false;
        countSections[0].style.opacity=1;
        countSections[1].style.opacity=1;

        let checkTime=setInterval(function (){
            if(!isPaused){
                console.log("Timing")
                msCount+=10;
                timeTxt.innerHTML=(genDuration-secCount)+":"+(1000-msCount)/10;
                if(msCount==1000){
                    msCount=0;
                    if(secCount==genDuration){
                        if(currentGen==gens){
                            testing=true;
                            countSections[0].children[0].innerHTML="Testing"
                            countSections[0].children[1].style.opacity=0;
                            test();
                            clearInterval(checkTime);
                        }
                        else{
                            currentGen++;
                            refresh();
                            genTxt.innerHTML=currentGen+" of "+gens;
                            secCount=0;
                        }
                    }
                    else{
                        secCount++;
                        msCount=0;
                    }
                }
            }
        }, 10)
        init();
        animate();
    }
}

function generateTraffic(){
    traffic=[
        new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2),
        new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2),
    ];
    return traffic
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI",3,rayCount,raySpread));
    }
    return cars;
}
function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));

    console.log("saved");
}
function discard(){
    localStorage.removeItem("bestBrain");
    console.log("save discarded");
}
function togglePause(){
    isPaused=isPaused?false:true;
    pauseImg.src=isPaused?"img/icon_play.png":"img/icon_pause.png"
    if(!isPaused){
        animate();
    }
    else{
        var my_gradient = carCtx.createLinearGradient(0, 0, 0, 170);
        my_gradient.addColorStop(0, "rgba(220, 220, 220, 0.8)");
        my_gradient.addColorStop(1, "rgba(120, 120, 120, 0.6)");
        carCtx.fillStyle = my_gradient;
        carCtx.fillRect(0, 0, carCanvas.width, carCanvas.height); 

        carCtx.font = "30px Montserrat";
        carCtx.fillStyle = "black";
        carCtx.textAlign = "center";
        carCtx.fillText("Paused", carCanvas.width/2, carCanvas.height/2);
    }
}

function animate(time){
    if(!isPaused){
        for(let i=0;i<traffic.length;i++){
            traffic[i].update(road.borders,[]);
        }
        for(let i=0;i<cars.length;i++){
            cars[i].update(road.borders,traffic);
        }
        bestCar=cars.find(
            c=>c.y==Math.min(
                ...cars.map(c=>c.y)
            ));

        carCanvas.height=window.innerHeight*0.6;

        carCtx.save();
        carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

        road.draw(carCtx);
        for(let i=0;i<traffic.length;i++){
            traffic[i].draw(carCtx,"red");
        }
        carCtx.globalAlpha=0.2;
        for(let i=0;i<cars.length;i++){
            cars[i].draw(carCtx,"blue");
        }
        carCtx.globalAlpha=1;
        bestCar.draw(carCtx,"blue",true);

        carCtx.restore();
        requestAnimationFrame(animate);
    }


    if(testing){ 
        if(bestCar.damaged){
            console.log("Test finished with a crash");
            clearInterval(testTime);
            discard();
            testing=false;
            countSections[0].style.opacity=0;
            countSections[1].style.opacity=0;
            isPaused=true;
            endMessages[0].classList.add('active');
            endScreen.classList.add('active');
        }
        else if(bestCar.y<traffic[6].y){
            console.log("Test passed");
            clearInterval(testTime);
            discard();
            testing=false;
            countSections[0].style.opacity=0;
            countSections[1].style.opacity=0;
            isPaused=true;
            endMessages[2].classList.add('active');
            endScreen.classList.add('active');
        }
    }
    
}

function init(){

    traffic=generateTraffic();
    cars=generateCars(children);
    bestCar=cars[0];
    
    if(localStorage.getItem("bestBrain")){
        for(let i=0;i<cars.length;i++){
            cars[i].brain=JSON.parse(
                localStorage.getItem("bestBrain"));
            if(i!=0){
                NeuralNetwork.mutate(cars[i].brain,0.5);
            }
        }
    }
}

function refresh(){
    isPaused=true;
    save();
    cars=[];
    traffic=[];
    init();
    isPaused=false;
}

function test(){
    console.log("Testing");
    isPaused=true;
    save();
    cars=[];
    traffic=[];
    traffic=generateTraffic();
    cars=generateCars(1);
    bestCar=cars[0];
    if(localStorage.getItem("bestBrain")){
        cars[0].brain=JSON.parse(localStorage.getItem("bestBrain"));
    }

    isPaused=false;

    secCount=0;
    msCount=0;
    testTime=setInterval(function (){
        if(!isPaused){
            msCount+=10;
            timeTxt.innerHTML=(testDuration-secCount)+":"+(1000-msCount)/10;
            if(msCount==1000){
                msCount=0;
                if(secCount==testDuration){
                    console.log("Test time up")
                    testing=false;
                    countSections[0].style.opacity=0;
                    countSections[1].style.opacity=0;
                    discard();
                    isPaused=true;
                    endMessages[1].classList.add('active');
                    endScreen.classList.add('active');
                    clearInterval(testTime);
                }
                else{
                    secCount++;
                    msCount=0;
                }
            }
        }
    }, 10)
    
}
function fullReset() {
    clearInterval(checkTime);
    clearInterval(testTime);

    cars=[];
    traffic=[];
    bestBrain=null;
    bestCar=null;

    secCount=0;
    msCount=0;
    currentGen=1;
    console.log("currentGen=1");
    isPaused=false;
    testing=false;

    startBtn.style.opacity=1;
    startBtn.style.pointerEvents="all";
    pauseBtn.style.opacity=0;
    pauseBtn.style.pointerEvents="none";
    countSections[0].children[0].innerHTML="Generation";
    genTxt.innerHTML=currentGen+" of "+gens;
    timeTxt.innerHTML=secCount+":"+msCount;
    countSections[0].style.opacity=0;
    countSections[1].style.opacity=0;
    
    document.getElementById('sensors').value='';
    document.getElementById('angle').value='';
    document.getElementById('children').value='';
    document.getElementById('gens').value=5;
}
function eraseEnd(){
    endScreen.classList.remove('active');
    endMessages[0].classList.remove('active');
    endMessages[1].classList.remove('active');
    endMessages[2].classList.remove('active');
}
