let users = [
  { skills: ["JS", "HTML"] },
  { skills: ["CSS"] },
  { skills: ["JS", "CSS"] }
];

let skills = users.flatMap(i => i.skills);

// Output: ["JS", "HTML", "CSS"]
console.log(skills);