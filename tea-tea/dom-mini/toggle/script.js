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


btn.addEventListener("mousemove", () => {
    btn.style.backgroundColor = "teal";
  btn.addEventListener("mouseleave", () => {
    btn.style.backgroundColor = "";
  });
});

btn.addEventListener("click", () => {
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "t") btn.click();
}); 