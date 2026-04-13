const images = Array.from({length: 117}, (_, i) => `img (${i+1}).jpg`);

    const gallery = document.getElementById("gallery");

    images.forEach(img => {
      const div = document.createElement("div");
      div.className = "photo";

      div.innerHTML = `<img src="server1/${img}">`;

      gallery.appendChild(div);
    });