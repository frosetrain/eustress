import { animate, delay } from "motion";

export function showShout(message: string, warning: boolean) {
    const shoutDiv = document.getElementById("shout")!;

    // shoutElement.style.opacity = "1";
    // shoutElement.style.transform = "";
    const shoutP = document.createElement("p");
    if (warning) {
        shoutP.classList.add("font-bold");
        shoutP.classList.add("text-orange-600");
        shoutP.classList.add("dark:text-orange-300");
    } else {
        shoutP.classList.add("text-gray-700");
        shoutP.classList.add("dark:text-gray-200");
    }
    const node = document.createTextNode(message);
    shoutP.appendChild(node);
    shoutDiv.appendChild(shoutP);
    const sequence = [
        [shoutP, { scale: 0.5, opacity: 0 }, { duration: 0 }],
        [shoutP, { scale: 1, opacity: 1 }, { ease: "easeOut", duration: 0.2 }],
        [shoutP, { scale: 0.5, opacity: 0 }, { ease: "easeIn", duration: 1, delay: 1 }],
    ];
    animate(sequence);
    delay(() => {
        shoutP.remove();
    }, 2.2);
}

//             <p id="shout-hint" class="text-gray-700 dark:text-gray-200">{shouts.hint}</p>
// <p id="shout-warning" class="font-bold text-orange-600 dark:text-orange-300">{shouts.warning}</p>
