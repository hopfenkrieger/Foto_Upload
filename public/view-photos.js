document.addEventListener("DOMContentLoaded", async function () {
    const photoList = document.getElementById("photo-list");
    const response = await axios.get("/view-photos");
  
    const photos = response.data.split("\n").filter((item) => item);
  
    photos.forEach((id) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <img src="https://res.cloudinary.com/${cloud_name}/image/upload/w_200,h_100,c_fill,q_100/${id}.jpg">
        <form action="/delete-photo" method="POST">
          <input type="hidden" name="id" value="${id}" />
          <button type="submit">Delete</button>
        </form>
      `;
      photoList.appendChild(listItem);
    });
  });
  