const btn = document.getElementById("t-button");

const title = document.getElementById("title");

let text = btn.textContent;

btn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  btn.textContent = btn.textContent === text ? "Switch to Light Mode" : text;

  title.textContent = document.body.classList.contains("dark")
    ? "Dark Mode"
    : "Light Mode";
});

// btn.addEventListener("mouseenter", () => {
//     btn.style.backgroundColor = "red";

// });

// btn.addEventListener("mouseleave", () => {
//     btn.style.backgroundColor = "";
// });
