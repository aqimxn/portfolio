let navLink = document.querySelectorAll(".nav-link");

navLink.forEach(link => {
    link.addEventListener("click", () => {
        navLink.forEach(link => {
            link.classList.remove("active");
        });
        link.classList.add("active");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const el = document.querySelector(".type-loop");
    if (!el) return;

    const words = (el.getAttribute("data-words") || "")
        .split(",").map(s => s.trim()).filter(Boolean);

    const colors = (el.getAttribute("data-colors") || "")
        .split(",").map(s => s.trim());

    if (!words.length) return;

    let w = 0, i = 0, deleting = false;

    const typeSpeed = 80;
    const deleteSpeed = 50;
    const holdAfterType = 900;
    const holdAfterDelete = 250;

    function applyColor(idx){
        const c = colors[idx] || colors[0] || "#000";
        el.style.color = c;
    }

    function step() {
        const word = words[w];
        applyColor(w);

        if (!deleting) {
            i++;
            el.textContent = word.slice(0, i);

        if (i === word.length) {
            deleting = true;
            setTimeout(step, holdAfterType);
            return;
        }
        setTimeout(step, typeSpeed);
        } else {
            i--;
            el.textContent = word.slice(0, i);

        if (i === 0) {
            deleting = false;
            w = (w + 1) % words.length;
            setTimeout(step, holdAfterDelete);
            return;
        }
        setTimeout(step, deleteSpeed);
        }
    }

    step();
});


