document.querySelector(".bars").addEventListener("click", function () {
  document.querySelector(".wrapper").classList.toggle("active");
});

document.querySelector(".toggle-dark-mode .switch").addEventListener("click", () => {
  toggleTransition(false);

  document.body.classList.toggle("dark-mode");

  setTimeout(() => {
    toggleTransition(true);
  }, 0);
});

function toggleTransition(state) {
  const transitionStyle = state ? "all 0.3s ease" : "none";

  const elements = document.querySelectorAll(
    ".sidebar, .sidebar ul li, .dark-mode, .container, .save-btn, .saved-word-item, .dropdown-item , .saved-buttons, .quizButton, .timeInput, .amountInput"
  );

  elements.forEach((el) => {
    el.style.transition = transitionStyle;
  });
}
