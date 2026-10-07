/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(".reveal");


const observer =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(
                (entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                    }

                }
            );

        },

        {
            threshold: 0.12
        }

    );


revealElements.forEach(
    (element) => {

        observer.observe(element);

    }
);


/* =========================================
   MOOD
========================================= */

const moodButtons =
    document.querySelectorAll(".mood-button");

const selectedMood =
    document.getElementById("selectedMood");

const heroMood =
    document.getElementById("heroMood");


moodButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                moodButtons.forEach(
                    (item) => {

                        item.classList.remove("active");

                    }
                );


                button.classList.add("active");


                const mood =
                    button.dataset.mood;


                selectedMood.textContent =
                    mood;


                heroMood.textContent =
                    mood;


                showToast(
                    "Mood hôm nay đã được cập nhật ♡"
                );

            }
        );

    }
);


/* =========================================
   RANDOM FORTUNE
========================================= */

const fortunes = [

    "Hôm nay bạn không cần hoàn hảo, chỉ cần vui hơn hôm qua một chút ♡",

    "Một điều dễ thương đang trên đường tìm đến bạn đó ୨୧",

    "Bạn xứng đáng với những ngày thật dịu dàng.",

    "Có những ngày chậm một chút cũng chẳng sao.",

    "Nhớ tự thưởng cho mình một điều nhỏ xinh hôm nay ✿",

    "Bạn đang làm tốt hơn những gì bạn nghĩ đó.",

    "Một ngày bình thường vẫn có thể trở thành một kỷ niệm thật đẹp.",

    "Đừng quên uống nước, ăn ngon và yêu mình thêm một chút nha ♡",

    "Có thể hôm nay chưa hoàn hảo, nhưng vẫn có điều đáng để mỉm cười.",

    "Những điều tốt đẹp thường bắt đầu từ những bước rất nhỏ ✦",

    "Hãy cho bản thân thêm một chút thời gian. Bạn không cần phải vội.",

    "Một phiên bản thật xinh của bạn đang dần xuất hiện đó ୨୧"

];


const fortuneButton =
    document.getElementById("fortuneButton");

const fortuneModal =
    document.getElementById("fortuneModal");

const fortuneText =
    document.getElementById("fortuneText");

const closeFortune =
    document.getElementById("closeFortune");

const newFortune =
    document.getElementById("newFortune");


function getRandomFortune() {

    const randomIndex =
        Math.floor(
            Math.random() *
            fortunes.length
        );


    fortuneText.textContent =
        fortunes[randomIndex];

}


fortuneButton.addEventListener(
    "click",
    () => {

        getRandomFortune();

        fortuneModal.classList.add("open");

    }
);


newFortune.addEventListener(
    "click",
    getRandomFortune
);


closeFortune.addEventListener(
    "click",
    () => {

        fortuneModal.classList.remove("open");

    }
);


fortuneModal.addEventListener(
    "click",
    (event) => {

        if (event.target === fortuneModal) {

            fortuneModal.classList.remove("open");

        }

    }
);


/* =========================================
   SECRET LETTER
========================================= */

const openLetter =
    document.getElementById("openLetter");

const letterModal =
    document.getElementById("letterModal");

const closeLetter =
    document.getElementById("closeLetter");


openLetter.addEventListener(
    "click",
    () => {

        letterModal.classList.add("open");

    }
);


closeLetter.addEventListener(
    "click",
    () => {

        letterModal.classList.remove("open");

    }
);


letterModal.addEventListener(
    "click",
    (event) => {

        if (event.target === letterModal) {

            letterModal.classList.remove("open");

        }

    }
);


/* =========================================
   HEART BURST
========================================= */

const heartButton =
    document.getElementById("heartButton");


heartButton.addEventListener(
    "click",
    () => {

        for (
            let i = 0;
            i < 18;
            i++
        ) {

            setTimeout(
                createFlyingHeart,
                i * 55
            );

        }


        showToast(
            "Một chút dễ thương đã được thêm vào ♡"
        );

    }
);


function createFlyingHeart() {

    const heart =
        document.createElement("span");


    heart.className =
        "flying-heart";


    const symbols = [
        "♡",
        "♥",
        "✦",
        "୨୧",
        "✿"
    ];


    heart.textContent =
        symbols[
            Math.floor(
                Math.random() *
                symbols.length
            )
        ];


    heart.style.left =
        Math.random() * 90 + 5 + "vw";


    heart.style.bottom =
        Math.random() * 100 + "px";


    heart.style.fontSize =
        Math.random() * 18 + 18 + "px";


    document.body.appendChild(
        heart
    );


    setTimeout(
        () => {

            heart.remove();

        },

        1900
    );

}


/* =========================================
   THEME SWITCH
========================================= */

const themeButton =
    document.getElementById("themeButton");


themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "lavender"
        );


        if (
            document.body.classList.contains(
                "lavender"
            )
        ) {

            themeButton.textContent =
                "🌸";


            showToast(
                "Đã chuyển sang tím mộng mơ ✦"
            );

        }

        else {

            themeButton.textContent =
                "🎨";


            showToast(
                "Đã quay lại cherry milk ♡"
            );

        }

    }
);


/* =========================================
   BACK TO TOP
========================================= */

const topButton =
    document.getElementById("topButton");


window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 500) {

            topButton.classList.add(
                "visible"
            );

        }

        else {

            topButton.classList.remove(
                "visible"
            );

        }

    }
);


topButton.addEventListener(
    "click",
    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }
);


/* =========================================
   FAKE MUSIC PLAYER
========================================= */

const miniPlayButton =
    document.getElementById("miniPlayButton");

const miniProgressBar =
    document.getElementById("miniProgressBar");


let isPlaying = false;
let musicProgress = 20;
let musicInterval;


miniPlayButton.addEventListener(
    "click",
    () => {

        isPlaying = !isPlaying;


        if (isPlaying) {

            miniPlayButton.textContent =
                "❚❚";


            showToast(
                "Đang phát playlist nhỏ của mình ♪"
            );


            musicInterval =
                setInterval(
                    () => {

                        musicProgress += 1;


                        if (musicProgress > 100) {

                            musicProgress = 0;

                        }


                        miniProgressBar.style.width =
                            musicProgress + "%";

                    },

                    300
                );

        }

        else {

            miniPlayButton.textContent =
                "▶";


            clearInterval(
                musicInterval
            );

        }

    }
);


/* =========================================
   FAVORITE CARD BUTTONS
========================================= */

const favoriteLinks =
    document.querySelectorAll(
        ".favorite-link"
    );


favoriteLinks.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                showToast(
                    button.dataset.message
                );

            }
        );

    }
);


/* =========================================
   SOCIAL BUTTONS
========================================= */

const socialButtons =
    document.querySelectorAll(
        "[data-social]"
    );


socialButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                showToast(
                    button.dataset.social +
                    " của mình sẽ được thêm sau nha ♡"
                );

            }
        );

    }
);


/* =========================================
   TOAST
========================================= */

const toast =
    document.getElementById("toast");


let toastTimer;


function showToast(message) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },

            2300
        );

}


/* =========================================
   BROWSER TITLE
========================================= */

const pageTitles = [

    "Góc nhỏ của Thu Hương ♡",

    "Bạn vẫn còn ở đây nè ୨୧",

    "Một chiếc web rất xinh ✦",

    "Thu Hương's little world ♡"

];


let pageTitleIndex = 0;


setInterval(
    () => {

        document.title =
            pageTitles[
                pageTitleIndex
            ];


        pageTitleIndex =
            (
                pageTitleIndex + 1
            )
            %
            pageTitles.length;

    },

    3200
);


/* =========================================
   ESC CLOSE MODALS
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            letterModal.classList.remove(
                "open"
            );

            fortuneModal.classList.remove(
                "open"
            );

        }

    }
);