const total = 150;

const gallery = document.getElementById("gallery");

for (let i = 1; i <= total; i++) {
  const div = document.createElement("div");
  div.className = "photo";

  const img = document.createElement("img");

  img.src = `server1/img (${i}).jpg`;

  img.onerror = () => {
    img.src = `server1/img (${i}).png`;
  };

  div.appendChild(img);
  gallery.appendChild(div);
}
