const sections = document.querySelectorAll('section');
const navSections = document.querySelectorAll('.nav-btns');
const navBtns = document.querySelectorAll('.nav-btn');
const allSections = document.querySelectorAll('.main-content');
const homeSecs = document.querySelectorAll('.home-section');

const getStarted = document.getElementById("get-started");
const goToSim = document.getElementById("go-to-sim");

function PageTransitions(){
    allSections[0].addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if(id) {
            sections.forEach((section) => {
                section.classList.remove('active')
            })
            fullReset();   
            const element = document.getElementById(id);
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            element.classList.add('active');

            let currentBtn = document.querySelectorAll('.nav-btn.active');
            currentBtn[0].className = currentBtn[0].className.replace('active', '');

            let newBtn=document.querySelectorAll('p.'+id);
            newBtn[0].className+='active';
        }
    })

}

getStarted.addEventListener('click', function(){
    homeSecs[1].scrollIntoView();
})
goToSim.addEventListener('click', function(){
    homeSecs[2].scrollIntoView();
})

PageTransitions()